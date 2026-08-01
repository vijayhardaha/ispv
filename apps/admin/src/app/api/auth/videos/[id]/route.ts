/** Run on the Edge runtime for faster cold starts and DB response times. */
export const runtime = 'edge';

import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { DASHBOARD_STATS_REVALIDATE_SECONDS, DASHBOARD_STATS_TAG } from '@/constants/cache';
import { checkDuplicate, deleteVideoById, requireUser } from '@/lib/api';
import { videoFormSchema } from '@/lib/db';
import { createServerSupabase } from '@/lib/db/supabase-server';

/**
 * Updates an existing video record by ID with duplicate validation.
 *
 * @param {Request} req - Incoming request with updated video data.
 * @param {{ params: Promise<{ id: string }> }} context - Route context containing the video ID.
 *
 * @returns {Promise<NextResponse>} JSON response with the updated video.
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;
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
    const dup = await checkDuplicate(supabase, 'video_url', parsed.data.video_url, id);
    if (dup) {
      return dup;
    }
  }

  if (parsed.data.video_id) {
    const dup = await checkDuplicate(supabase, 'video_id', parsed.data.video_id, id);
    if (dup) {
      return dup;
    }
  }

  const { data, error } = await supabase.from('videos').update(parsed.data).eq('id', id).select().single();
  if (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
  revalidateTag(DASHBOARD_STATS_TAG, { expire: DASHBOARD_STATS_REVALIDATE_SECONDS });
  return NextResponse.json(data);
}

/**
 * Handles trash, restore, and permanent-delete actions on a video.
 * Accepts JSON body: { action: 'trash' | 'restore' | 'delete', reason?: string }
 *
 * @param {Request} req - Incoming request with action metadata.
 * @param {{ params: Promise<{ id: string }> }} context - Route context containing the video ID.
 *
 * @returns {Promise<NextResponse>} JSON response with operation result.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const guard = await requireUser(supabase);
  if (guard) {
    return guard;
  }

  const { action, reason } = await req.json();

  switch (action) {
    case 'trash': {
      const { error } = await supabase.rpc('trash_video', {
        p_video_id: id,
        p_reason: reason || 'Manually trashed by admin',
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      revalidateTag(DASHBOARD_STATS_TAG, { expire: DASHBOARD_STATS_REVALIDATE_SECONDS });
      return NextResponse.json({ ok: true });
    }

    case 'restore': {
      const { error } = await supabase.rpc('restore_video', { p_video_id: id });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      revalidateTag(DASHBOARD_STATS_TAG, { expire: DASHBOARD_STATS_REVALIDATE_SECONDS });
      return NextResponse.json({ ok: true });
    }

    case 'delete': {
      const res = await deleteVideoById(supabase, id);
      if (res.ok) {
        revalidateTag(DASHBOARD_STATS_TAG, { expire: DASHBOARD_STATS_REVALIDATE_SECONDS });
      }
      return res;
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}

/**
 * Hard-deletes a video record by ID (permanent, cannot be undone).
 * Use POST with action:'trash' for soft delete.
 *
 * @param {Request} _req - Incoming delete request (unused).
 * @param {{ params: Promise<{ id: string }> }} context - Route context containing the video ID.
 *
 * @returns {Promise<NextResponse>} JSON response confirming deletion.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const guard = await requireUser(supabase);
  if (guard) {
    return guard;
  }

  const res = await deleteVideoById(supabase, id);
  if (res.ok) {
    revalidateTag(DASHBOARD_STATS_TAG, { expire: DASHBOARD_STATS_REVALIDATE_SECONDS });
  }
  return res;
}
