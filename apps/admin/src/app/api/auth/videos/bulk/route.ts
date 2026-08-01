/** Run on the Edge runtime for faster cold starts and DB response times. */
export const runtime = 'edge';

import { NextResponse } from 'next/server';

import { revalidateDashboardStats } from '@/constants/cache';
import { jsonError, requireUser, deleteBlob } from '@/lib/api';
import { createServerSupabase } from '@/lib/db/supabase-server';

/**
 * Valid status values for the update_status bulk action.
 */
const VALID_STATUSES = ['draft', 'published', 'rejected'] as const;

/**
 * Handles a bulk operation result: maps Supabase errors, revalidates the
 * dashboard stats cache, and returns the success or error response.
 *
 * @param {{ message: string } | null} error - Supabase error object, or null on success.
 * @param {string[]} ids - Video IDs the operation targeted.
 *
 * @returns {NextResponse} Error response, or success response with the count.
 */
function finalizeBulk(error: { message: string } | null, ids: string[]): NextResponse {
  const err = jsonError(error);
  if (err) {
    return err;
  }
  revalidateDashboardStats();
  return NextResponse.json({ ok: true, count: ids.length });
}

/**
 * Applies a bulk update to the selected videos and returns the response.
 *
 * @param {Awaited<ReturnType<typeof createServerSupabase>>} supabase - Authenticated Supabase client.
 * @param {string[]} ids - Video IDs to update.
 * @param {Record<string, unknown>} payload - Update fields to apply.
 *
 * @returns {Promise<NextResponse>} Success or error JSON response.
 */
async function applyBulkUpdate(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  ids: string[],
  payload: Record<string, unknown>
): Promise<NextResponse> {
  const { error } = await supabase.from('videos').update(payload).in('id', ids);
  return finalizeBulk(error, ids);
}

/**
 * Performs bulk operations on multiple video records.
 * Supports `delete`, `update_status`, `trash`, and `restore` actions.
 *
 * @param {Request} req - Incoming request with { action, ids, status?, reason? }.
 *
 * @returns {Promise<NextResponse>} JSON response with operation result.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const { action, ids, status, reason } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 });
  }

  const supabase = await createServerSupabase();

  const guard = await requireUser(supabase);
  if (guard) {
    return guard;
  }

  switch (action) {
    case 'delete': {
      // Fetch thumbnail_urls before bulk-deleting records
      const { data: videos } = await supabase.from('videos').select('thumbnail_url').in('id', ids);
      if (videos) {
        await Promise.all(videos.map((v: { thumbnail_url: string | null }) => deleteBlob(v.thumbnail_url)));
      }

      const { error } = await supabase.from('videos').delete().in('id', ids);
      return finalizeBulk(error, ids);
    }

    case 'update_status': {
      if (!status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
        return NextResponse.json({ error: 'Invalid or missing status' }, { status: 400 });
      }
      return applyBulkUpdate(supabase, ids, { status });
    }

    case 'trash': {
      const reasonText = reason || 'Manually trashed by admin';
      return applyBulkUpdate(supabase, ids, { trashed_at: new Date().toISOString(), trash_reason: reasonText });
    }

    case 'restore': {
      return applyBulkUpdate(supabase, ids, { trashed_at: null, trash_reason: null });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
