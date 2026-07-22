import { NextResponse } from 'next/server';

import { createServerSupabase } from '@/lib/supabase-server';

/**
 * Retrieves all videos with category data, ordered by creation date.
 *
 * @returns {Promise<NextResponse>} JSON response with the video list.
 */
export async function GET() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('videos')
    .select('*, categories(*)')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/**
 * Creates a new video record.
 *
 * @param {Request} req - Incoming request with video data.
 *
 * @returns {Promise<NextResponse>} JSON response with the created video.
 */
export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const body = await req.json();
  const { data, error } = await supabase.from('videos').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
