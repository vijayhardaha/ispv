/** Run on the Edge runtime for faster cold starts and DB response times. */
export const runtime = 'edge';

import { NextResponse } from 'next/server';

import { revalidateDashboardStats } from '@/constants/cache';
import { checkDuplicate, deleteVideoById, requireUser } from '@/lib/api';
import { videoFormSchema } from '@/lib/db';
import { createServerSupabase } from '@/lib/db/supabase-server';

/**
 * Resolves the video ID, creates a Supabase client, and guards for auth.
 * Returns the resolved ID and client, or an error response when unauthorized.
 *
 * @param {Promise<{ id: string }>} params - Route params promise containing the video ID.
 *
 * @returns {Promise<{ id: string; supabase: Awaited<ReturnType<typeof createServerSupabase>> } | NextResponse>}
 * Resolved ID and client, or an auth error response.
 */
async function resolveAuthedVideo(
  params: Promise<{ id: string }>
): Promise<{ id: string; supabase: Awaited<ReturnType<typeof createServerSupabase>> } | NextResponse> {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const guard = await requireUser(supabase);
  if (guard) {
    return guard;
  }

  return { id, supabase };
}

/**
 * Updates an existing video record by ID with duplicate validation.
 *
 * @param {Request} req - Incoming request with updated video data.
 * @param {{ params: Promise<{ id: string }> }} context - Route context containing the video ID.
 *
 * @returns {Promise<NextResponse>} JSON response with the updated video.
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const ctx = await resolveAuthedVideo(params);
  if (ctx instanceof NextResponse) {
    return ctx;
  }

  const { id, supabase } = ctx;

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

  revalidateDashboardStats();
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
  const ctx = await resolveAuthedVideo(params);
  if (ctx instanceof NextResponse) {
    return ctx;
  }

  const { id, supabase } = ctx;

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

      revalidateDashboardStats();
      return NextResponse.json({ ok: true });
    }

    case 'restore': {
      const { error } = await supabase.rpc('restore_video', { p_video_id: id });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      revalidateDashboardStats();
      return NextResponse.json({ ok: true });
    }

    case 'delete': {
      const res = await deleteVideoById(supabase, id);
      if (res.ok) {
        revalidateDashboardStats();
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
  const ctx = await resolveAuthedVideo(params);
  if (ctx instanceof NextResponse) {
    return ctx;
  }
  const { id, supabase } = ctx;

  const res = await deleteVideoById(supabase, id);
  if (res.ok) {
    revalidateDashboardStats();
  }

  return res;
}
