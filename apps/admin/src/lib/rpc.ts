/**
 * Utility functions for interacting with the Supabase RPC layer.
 * Handles the new pagination-aware RPC response format.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { GetVideosApiResponse, VideoRecord, PaginationMeta } from './types';

/**
 * Filters object for get_videos_for_api RPC.
 *
 * @typedef {Object} GetVideosFilters
 * @property {string} [status] - Filter by video status (draft, pending_review, published, rejected)
 * @property {string} [search] - Search query across video_url, video_id, description, city
 * @property {string} [category] - Filter by category slug
 * @property {string} [location] - Filter by location slug
 * @property {number} [page] - Page number (1-based, default: 1)
 * @property {number} [per_page] - Items per page (default: 50, max: 500)
 */
export interface GetVideosFilters {
  status?: string | null;
  search?: string | null;
  category?: string | null;
  location?: string | null;
  page?: number;
  per_page?: number;
}

/**
 * Fetch videos with pagination support using the get_videos_for_api RPC.
 *
 * @param {SupabaseClient} supabase - Supabase client instance
 * @param {GetVideosFilters} filters - Filter options for the query
 * @returns {Promise<{ data: VideoRecord[]; pagination: PaginationMeta; } | null>} Videos and pagination metadata, or null on error
 *
 * @example
 * const { data: videos, pagination } = await getVideosForApi(supabase, {
 *   status: 'published',
 *   category: 'protests',
 *   page: 1,
 *   per_page: 20
 * }) ?? { data: [], pagination: {} };
 *
 * // Use pagination for UI
 * console.log(`Page ${pagination.page} of ${pagination.total_pages}`);
 * console.log(`Total videos: ${pagination.total_count}`);
 */
export async function getVideosForApi(
  supabase: SupabaseClient,
  filters: GetVideosFilters = {}
): Promise<GetVideosApiResponse | null> {
  const { data: response, error } = await supabase.rpc('get_videos_for_api', {
    filters: {
      status: filters.status || null,
      search: filters.search || null,
      category: filters.category || null,
      location: filters.location || null,
      page: filters.page || 1,
      per_page: filters.per_page || 50,
    },
  });

  if (error) {
    console.error('Error fetching videos:', error);
    return null;
  }

  return response as GetVideosApiResponse;
}

/**
 * Move a video to trash (soft delete).
 *
 * @param {SupabaseClient} supabase - Supabase client instance
 * @param {string} videoId - Video UUID
 * @param {string} reason - Reason for trashing the video
 * @returns {Promise<boolean>} True if successful, false on error
 *
 * @example
 * const success = await trashVideo(supabase, videoId, 'Violates community guidelines');
 */
export async function trashVideo(
  supabase: SupabaseClient,
  videoId: string,
  reason: string = 'No reason provided'
): Promise<boolean> {
  const { error } = await supabase.rpc('trash_video', {
    p_video_id: videoId,
    p_reason: reason,
  });

  if (error) {
    console.error('Error trashing video:', error);
    return false;
  }

  return true;
}

/**
 * Restore a video from trash.
 *
 * @param {SupabaseClient} supabase - Supabase client instance
 * @param {string} videoId - Video UUID
 * @returns {Promise<boolean>} True if successful, false on error
 *
 * @example
 * const success = await restoreVideo(supabase, videoId);
 */
export async function restoreVideo(supabase: SupabaseClient, videoId: string): Promise<boolean> {
  const { error } = await supabase.rpc('restore_video', {
    p_video_id: videoId,
  });

  if (error) {
    console.error('Error restoring video:', error);
    return false;
  }

  return true;
}

/**
 * Permanently delete videos that have been in trash for longer than the grace period.
 * **WARNING**: This operation is irreversible.
 *
 * @param {SupabaseClient} supabase - Supabase client instance
 * @param {number} gracePeriodDays - Number of days before permanent deletion (default: 30)
 * @returns {Promise<number>} Number of videos permanently deleted, or -1 on error
 *
 * @example
 * // Permanently delete videos trashed more than 30 days ago
 * const deletedCount = await purgeTrash(supabase, 30);
 * console.log(`Purged ${deletedCount} videos`);
 */
export async function purgeTrash(
  supabase: SupabaseClient,
  gracePeriodDays: number = 30
): Promise<number> {
  const { data, error } = await supabase.rpc('purge_old_trashed_videos', {
    p_grace_period_days: gracePeriodDays,
  });

  if (error) {
    console.error('Error purging trash:', error);
    return -1;
  }

  return data as number;
}

/**
 * Build query string for pagination links.
 *
 * @param {Object} params - Parameters to include in the query string
 * @returns {string} Query string (e.g., "?page=2&per_page=20&status=published")
 *
 * @example
 * const queryString = buildQueryString({ page: 2, status: 'published' });
 * // Returns: "?page=2&status=published"
 */
export function buildQueryString(params: Record<string, string | number | null | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Calculate pagination boundaries for a given page.
 *
 * @param {number} page - Current page number (1-based)
 * @param {number} perPage - Items per page
 * @param {number} totalCount - Total number of items
 * @returns {Object} Start and end item numbers for display
 *
 * @example
 * const { start, end } = getPaginationBoundaries(2, 20, 150);
 * // Returns: { start: 21, end: 40 }
 */
export function getPaginationBoundaries(
  page: number,
  perPage: number,
  totalCount: number
): { start: number; end: number } {
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalCount);
  return { start, end };
}

/**
 * Build pagination links for browser history/navigation.
 *
 * @param {Object} options - Pagination options
 * @param {number} options.currentPage - Current page number
 * @param {number} options.totalPages - Total number of pages
 * @param {number} [options.maxLinks=5] - Maximum number of page links to show
 * @returns {Object} Object with prev, next, and pages array
 *
 * @example
 * const links = buildPaginationLinks({ currentPage: 5, totalPages: 20, maxLinks: 5 });
 * // Returns: { prev: 4, next: 6, pages: [3, 4, 5, 6, 7] }
 */
export function buildPaginationLinks(options: {
  currentPage: number;
  totalPages: number;
  maxLinks?: number;
}): {
  prev: number | null;
  next: number | null;
  pages: number[];
} {
  const { currentPage, totalPages, maxLinks = 5 } = options;

  const prev = currentPage > 1 ? currentPage - 1 : null;
  const next = currentPage < totalPages ? currentPage + 1 : null;

  // Calculate which page numbers to show
  const halfLinks = Math.floor(maxLinks / 2);
  let startPage = Math.max(1, currentPage - halfLinks);
  let endPage = Math.min(totalPages, startPage + maxLinks - 1);

  // Adjust if we're near the end
  if (endPage - startPage < maxLinks - 1) {
    startPage = Math.max(1, endPage - maxLinks + 1);
  }

  const pages: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return { prev, next, pages };
}
