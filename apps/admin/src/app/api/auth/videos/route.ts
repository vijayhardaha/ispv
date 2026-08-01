/** Run on the Edge runtime for faster cold starts and DB response times. */
export const runtime = 'edge';

import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { DASHBOARD_STATS_REVALIDATE_SECONDS, DASHBOARD_STATS_TAG } from '@/constants/cache';
import { checkDuplicate, requireUser } from '@/lib/api';
import { videoFormSchema } from '@/lib/db';
import { createServerSupabase } from '@/lib/db/supabase-server';

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

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) {
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
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

  if (parsed.data.video_url) {
    const dup = await checkDuplicate(supabase, 'video_url', parsed.data.video_url);
    if (dup) {
      return dup;
    }
  }

  if (parsed.data.video_id) {
    const dup = await checkDuplicate(supabase, 'video_id', parsed.data.video_id);
    if (dup) {
      return dup;
    }
  }

  const { data, error } = await supabase.from('videos').insert(parsed.data).select().single();
  if (error) {
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }

  revalidateTag(DASHBOARD_STATS_TAG, { expire: DASHBOARD_STATS_REVALIDATE_SECONDS });
  return NextResponse.json(data);
}
