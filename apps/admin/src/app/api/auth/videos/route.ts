/** Run on Edge Runtime for faster cold starts and global availability. */
export const runtime = 'edge';

import { NextResponse } from 'next/server';

import { videoFormSchema } from '@/lib/schemas';
import { createServerSupabase } from '@/lib/supabase-server';

/**
 * Retrieves all videos ordered by creation date.
 *
 * @returns {Promise<NextResponse>} JSON response with the video list.
 */
export async function GET() {
  const supabase = await createServerSupabase();

  // Require authenticated user for admin list access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

/**
 * Creates a new video record with duplicate validation.
 *
 * @param {Request} req - Incoming request with video data.
 *
 * @returns {Promise<NextResponse>} JSON response with the created video.
 */
export async function POST(req: Request) {
  const supabase = await createServerSupabase();

  // Require authenticated user for creating videos
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const parsed = videoFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request body' }, { status: 400 });
  }

  if (body.video_url) {
    const { data: existing } = await supabase.from('videos').select('id').eq('video_url', body.video_url).maybeSingle();
    if (existing) {
      return NextResponse.json({ error: 'A video with this URL already exists' }, { status: 409 });
    }
  }

  if (body.video_id) {
    const { data: existing } = await supabase.from('videos').select('id').eq('video_id', body.video_id).maybeSingle();
    if (existing) {
      return NextResponse.json({ error: 'A video with this ID already exists' }, { status: 409 });
    }
  }

  const { data, error } = await supabase.from('videos').insert(body).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
