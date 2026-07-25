import { NextResponse } from 'next/server';

import { createServiceSupabase, checkRateLimit } from '@/lib/api';

/**
 * Increments the view count for a video via the increment_video_view RPC.
 * Rate-limited to 120 increments per minute per IP.
 *
 * @param {Request} req - Incoming request with video_id in the body.
 *
 * @returns {Promise<NextResponse>} JSON response indicating success or error.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { video_id } = await req.json();
    if (!video_id) {
      return NextResponse.json({ error: 'video_id required' }, { status: 400 });
    }

    // Allow high view increments — users skip videos fast
    const allowed = await checkRateLimit(req, 'views', 120, 60);
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const sb = createServiceSupabase();
    if (!sb) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const { error } = await sb.rpc('increment_video_view', { p_video_id: video_id });
    if (error) {
      return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
  }
}
