/** Run on Edge Runtime for faster cold starts and global availability. */
export const runtime = 'edge';

import { NextResponse } from 'next/server';

import { checkDuplicate, deleteVideoById, requireUser } from '@/lib/api-utils';
import { videoFormSchema } from '@/lib/schemas';
import { createServerSupabase } from '@/lib/supabase-server';

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

  if (body.video_url) {
    const dup = await checkDuplicate(supabase, 'video_url', body.video_url, id);
    if (dup) {
      return dup;
    }
  }

  if (body.video_id) {
    const dup = await checkDuplicate(supabase, 'video_id', body.video_id, id);
    if (dup) {
      return dup;
    }
  }

  const { data, error } = await supabase.from('videos').update(body).eq('id', id).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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

      return NextResponse.json({ ok: true });
    }

    case 'restore': {
      const { error } = await supabase.rpc('restore_video', { p_video_id: id });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    case 'delete': {
      return deleteVideoById(supabase, id);
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

  return deleteVideoById(supabase, id);
}
