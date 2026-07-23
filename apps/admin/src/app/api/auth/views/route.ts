import { NextResponse } from 'next/server';

import { createServerSupabase } from '@/lib/supabase-server';

/**
 * Increments the view count for a specific video.
 *
 * @param {Request} req - Incoming request with video_id.
 *
 * @returns {Promise<NextResponse>} JSON response confirming the view update.
 */
export async function POST(req: Request) {
  const { video_id } = await req.json();
  if (!video_id) {
    return NextResponse.json({ error: 'video_id required' }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc('increment_video_view', { p_video_id: video_id });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
