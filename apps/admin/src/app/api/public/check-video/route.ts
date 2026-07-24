/** Run on Edge Runtime for faster cold starts and global availability. */
export const runtime = 'edge';

import { NextResponse } from 'next/server';

import { createServiceSupabase } from '@/lib/api-utils';
import { checkRateLimit } from '@/lib/rateLimit';
import { extractIgId } from '@/lib/instagram';

/**
 * Checks whether a video with the given Instagram URL or extracted video ID
 * already exists anywhere in the archive (including trashed or draft records).
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
    const videoUrl = (body.url ?? body.video_url ?? '').toString();
    if (!videoUrl) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    const videoId = extractIgId(videoUrl);
    const sb = createServiceSupabase();
    if (!sb) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const byUrl = sb
      .from('videos')
      .select('id, trashed_at, status')
      .eq('video_url', videoUrl)
      .maybeSingle();

    const byId =
      videoId &&
      sb
        .from('videos')
        .select('id, trashed_at, status')
        .eq('video_id', videoId)
        .maybeSingle();

    const [urlResult, idResult] = await Promise.all([byUrl, byId]);

    const urlData = urlResult && typeof urlResult !== 'string' ? urlResult.data : null;
    const idData = idResult && typeof idResult !== 'string' ? idResult.data : null;
    const record = urlData ?? idData ?? null;

    if (record) {
      return NextResponse.json({
        exists: true,
        trashed: record.trashed_at !== null && record.trashed_at !== undefined,
        status: record.status,
      });
    }

    return NextResponse.json({ exists: false });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal error' },
      { status: 500 }
    );
  }
}
