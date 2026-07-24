import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Guards a route handler by requiring an authenticated Supabase user.
 * Returns a 401 response if no user is found, or `null` to allow the handler to proceed.
 *
 * @param {SupabaseClient} supabase - Authenticated Supabase client.
 *
 * @returns {Promise<NextResponse | null>} 401 response if unauthorized, otherwise null.
 */
export const requireUser = async (supabase: SupabaseClient): Promise<NextResponse | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
};

/**
 * Builds a JSON error response for Supabase query errors.
 * Returns `null` if `error` is falsy, allowing inline use in guard patterns.
 *
 * @param {{ message: string } | null} error - Supabase error object, or null.
 * @param {number} [status] - HTTP status code for the response.
 *
 * @returns {NextResponse | null} Error response, or null if no error.
 */
export const jsonError = (error: { message: string } | null, status: number = 500): NextResponse | null => {
  if (!error) {
    return null;
  }
  return NextResponse.json({ error: error.message }, { status });
};

/**
 * Permanently deletes a single video record by ID.
 * Returns a JSON error response on failure, or a success response on completion.
 *
 * @param {SupabaseClient} supabase - Authenticated Supabase client.
 * @param {string} id - Video record UUID to delete.
 *
 * @returns {Promise<NextResponse>} Success or error response.
 */
export const deleteVideoById = async (supabase: SupabaseClient, id: string): Promise<NextResponse> => {
  const { error } = await supabase.from('videos').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
};

/**
 * Creates a Supabase client using the service role key for public API endpoints.
 * Returns `null` if required environment variables are missing.
 *
 * @returns {SupabaseClient | null} Configured service-role client, or null on misconfiguration.
 */
export const createServiceSupabase = (): SupabaseClient | null => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return null;
  }
  return createClient(supabaseUrl, serviceKey, { global: { fetch } } as any);
};

/**
 * Checks whether a video with the given field value already exists.
 * When `excludeId` is provided, the check excludes that record (for updates).
 *
 * @param {SupabaseClient} supabase - Authenticated Supabase client.
 * @param {'video_url' | 'video_id'} field - The field to check for duplicates.
 * @param {string} value - The value to match.
 * @param {string} [excludeId] - Optional ID to exclude from the check (for updates).
 *
 * @returns {Promise<NextResponse | null>} 409 response if duplicate found, otherwise null.
 */
export const checkDuplicate = async (
  supabase: SupabaseClient,
  field: 'video_url' | 'video_id',
  value: string,
  excludeId?: string
): Promise<NextResponse | null> => {
  let query = supabase.from('videos').select('id').eq(field, value);
  if (excludeId) {
    query = query.neq('id', excludeId);
  }
  const { data: existing } = await query.maybeSingle();
  if (existing) {
    const label = field === 'video_url' ? 'URL' : 'ID';
    const prefix = excludeId ? 'Another' : 'A';
    return NextResponse.json({ error: `${prefix} video with this ${label} already exists` }, { status: 409 });
  }
  return null;
};
