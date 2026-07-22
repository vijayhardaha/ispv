import { NextResponse } from 'next/server';

import { createServerSupabase } from '@/lib/supabase-server';

/**
 * Updates an existing video record by ID.
 *
 * @param {Request} req - Incoming request with updated video data.
 * @param {{ params: Promise<{ id: string }> }} context - Route context containing the video ID.
 *
 * @returns {Promise<NextResponse>} JSON response with the updated video.
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const body = await req.json();
  const { data, error } = await supabase.from('videos').update(body).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/**
 * Deletes a video record by ID.
 *
 * @param {Request} _req - Incoming delete request (unused).
 * @param {{ params: Promise<{ id: string }> }} context - Route context containing the video ID.
 *
 * @returns {Promise<NextResponse>} JSON response confirming deletion.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('videos').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
