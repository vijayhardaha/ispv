/** Run on Edge Runtime for faster cold starts and global availability. */
export const runtime = 'edge';

import { NextResponse } from 'next/server';

import { checkDuplicate, requireUser } from '@/lib/api-utils';
import { videoFormSchema } from '@/lib/schemas';
import { createServerSupabase } from '@/lib/supabase-server';

/**
 * Retrieves all videos ordered by creation date.
 *
 * @returns {Promise<NextResponse>} JSON response with the video list.
 */
export async function GET(): Promise<NextResponse> {
  const supabase = await createServerSupabase();

  const guard = await requireUser(supabase);
  if (guard) {
    return guard;
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
export async function POST(req: Request): Promise<NextResponse> {
  const supabase = await createServerSupabase();

  const guard = await requireUser(supabase);
  if (guard) {
    return guard;
  }

  const body = await req.json();

  const parsed = videoFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request body' }, { status: 400 });
  }

  if (body.video_url) {
    const dup = await checkDuplicate(supabase, 'video_url', body.video_url);
    if (dup) {
      return dup;
    }
  }

  if (body.video_id) {
    const dup = await checkDuplicate(supabase, 'video_id', body.video_id);
    if (dup) {
      return dup;
    }
  }

  const { data, error } = await supabase.from('videos').insert(body).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
