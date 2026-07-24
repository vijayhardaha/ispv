/** Run on Edge Runtime for faster cold starts and global availability. */
export const runtime = 'edge';

import { NextResponse } from 'next/server';

import { jsonError, requireUser } from '@/lib/api-utils';
import { createServerSupabase } from '@/lib/supabase-server';
import { deleteBlob } from '@/lib/upload';

/**
 * Valid status values for the update_status bulk action.
 */
const VALID_STATUSES = ['draft', 'pending_review', 'published', 'rejected'] as const;

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
      const err = jsonError(error);
      if (err) {
        return err;
      }
      return NextResponse.json({ ok: true, count: ids.length });
    }

    case 'update_status': {
      if (!status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
        return NextResponse.json({ error: 'Invalid or missing status' }, { status: 400 });
      }
      const { error } = await supabase.from('videos').update({ status }).in('id', ids);
      const err = jsonError(error);
      if (err) {
        return err;
      }
      return NextResponse.json({ ok: true, count: ids.length });
    }

    case 'trash': {
      const reasonText = reason || 'Manually trashed by admin';
      const { error } = await supabase
        .from('videos')
        .update({ trashed_at: new Date().toISOString(), trash_reason: reasonText })
        .in('id', ids);
      const err = jsonError(error);
      if (err) {
        return err;
      }
      return NextResponse.json({ ok: true, count: ids.length });
    }

    case 'restore': {
      const { error } = await supabase.from('videos').update({ trashed_at: null, trash_reason: null }).in('id', ids);
      const err = jsonError(error);
      if (err) {
        return err;
      }
      return NextResponse.json({ ok: true, count: ids.length });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
