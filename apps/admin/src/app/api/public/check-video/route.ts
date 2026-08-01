/** Run on the Edge runtime for faster cold starts and DB response times. */
export const runtime = 'edge';

import { NextResponse } from 'next/server';

import { createServiceSupabase, checkRateLimit } from '@/lib/api';
import { extractIgId, normalizeIgUrl } from '@/lib/utils';

/**
 * Checks whether a video with the given Instagram URL or extracted video ID
 * already exists anywhere in the archive (including trashed or draft records).
 *
 * Matches are resolved by exact `video_id` first, then normalized `video_url`,
 * so minor URL formatting differences (`www`, trailing slash, query params)
 * do not cause false negatives.
 *
 * @param {Request} req - Incoming request with `url` in the body.
 * @returns {Promise<NextResponse>} JSON response with existence and trash status.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const allowed = await checkRateLimit(req, 'check-video', 60, 60);
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.json();
    const rawUrl = (body.url ?? body.video_url ?? '').toString().trim();
    if (!rawUrl) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    const videoId = extractIgId(rawUrl);
    const normalizedUrl = normalizeIgUrl(rawUrl);
    const sb = createServiceSupabase();
    if (!sb) {
      console.warn('[check-video] Supabase client not configured');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    let byUrl: {
      data: { id: string; trashed_at: string | null; status: string } | null;
      error: { message: string } | null;
    } = { data: null, error: null };
    let byId: {
      data: { id: string; trashed_at: string | null; status: string } | null;
      error: { message: string } | null;
    } = { data: null, error: null };
    // Prefer stable video_id match when available
    if (videoId) {
      try {
        const idQuery = sb.from('videos').select('id, trashed_at, status').eq('video_id', videoId).maybeSingle();
        byId = await idQuery;
      } catch (idError) {
        console.error('[check-video] by-id query failed:', idError);
      }
    }

    // Fallback to normalized URL match
    if (!byId.data && !byId.error) {
      try {
        const urlQuery = sb
          .from('videos')
          .select('id, trashed_at, status')
          .eq('video_url', normalizedUrl)
          .maybeSingle();
        byUrl = await urlQuery;
      } catch (urlError) {
        console.error('[check-video] by-url query failed:', urlError);
      }
    }

    if (byUrl.error || byId.error) {
      const dbError = byId.error ?? byUrl.error;
      console.error('[check-video] database error:', dbError);
      return NextResponse.json({ error: 'Database lookup failed' }, { status: 500 });
    }

    const record = byId.data ?? byUrl.data ?? null;

    if (record) {
      return NextResponse.json({
        exists: true,
        trashed: record.trashed_at !== null && record.trashed_at !== undefined,
        status: record.status,
      });
    }

    return NextResponse.json({ exists: false });
  } catch (e) {
    console.error('[check-video] endpoint error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
  }
}
