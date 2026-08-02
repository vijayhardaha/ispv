/** Run on the Edge runtime for faster cold starts and DB response times. */
export const runtime = 'edge';

import { NextResponse } from 'next/server';

import { revalidateDashboardStats } from '@/constants/cache';
import { createServiceSupabase, checkRateLimit } from '@/lib/api';
import { submitVideoBodySchema } from '@/lib/db';
import { extractIgId, detectSource } from '@/lib/utils';

/**
 * Handles public video submission from the frontend submit dialog.
 * Validates the request body, extracts Instagram metadata, and calls the submit_video RPC.
 *
 * @param {Request} req - Incoming request with video URL, location, city, and hashtags.
 *
 * @returns {Promise<NextResponse>} JSON response with the submitted video record.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Rate limit: 5 submissions per minute per IP
    const allowed = await checkRateLimit(req, 'rl', 5, 60);
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.json();
    const rawTags = body.tags ?? body.hashtags;
    const parsed = submitVideoBodySchema.safeParse({
      video_url: body.url ?? body.video_url,
      tags: rawTags
        ? (Array.isArray(rawTags) ? rawTags : rawTags.split(','))
            .map((s: string) => s.trim().toLowerCase())
            .filter(Boolean)
        : undefined,
      category: body.location ?? null,
      categories: Array.isArray(body.categories) ? body.categories : undefined,
      location: null,
      city: body.city ?? null,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
    }

    const video_url = parsed.data.video_url as string;
    const video_id = extractIgId(video_url);
    const video_src = detectSource(video_url);
    if (!video_id) {
      return NextResponse.json({ error: 'Invalid instagram url' }, { status: 400 });
    }

    const sb = createServiceSupabase();
    if (!sb) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const { data, error } = await sb.rpc('submit_video', {
      p_video_url: video_url,
      p_video_id: video_id,
      p_video_src: video_src,
      p_tags: parsed.data.tags ? parsed.data.tags.join(',') : null,
      p_category: parsed.data.category ?? null,
      p_categories: parsed.data.categories ?? null,
      p_location: null,
      p_city: parsed.data.city ?? null,
    });

    if (error) {
      return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
    }
    revalidateDashboardStats();
    return NextResponse.json(data ?? { ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
  }
}
