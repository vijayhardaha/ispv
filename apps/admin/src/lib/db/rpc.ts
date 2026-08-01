/**
 * Utility functions for interacting with the Supabase RPC layer.
 * Handles the new pagination-aware RPC response format.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { GetVideosApiResponse } from './types';

/**
 * Filter options for the get_videos_for_api RPC.
 *
 * @type {GetVideosFilters}
 * @property {string | null} [status] - Filter by video status (draft, pending_review, published, rejected).
 * @property {string | null} [search] - Search query across video_url, video_id, description, city.
 * @property {string | null} [category] - Filter by category slug.
 * @property {string | null} [location] - Filter by location slug.
 * @property {string | null} [sort_by] - Sort column key (status, created, updated, posted, city, category, location).
 * @property {'asc' | 'desc' | null} [sort_dir] - Sort direction (default: desc).
 * @property {string | null} [trashed] - Trash filter ('only' shows trashed, otherwise excludes them).
 * @property {number} [page] - Page number (1-based, default: 1).
 * @property {number} [per_page] - Items per page (default: 50, max: 500).
 */
export interface GetVideosFilters {
  status?: string | null;
  search?: string | null;
  category?: string | null;
  location?: string | null;
  sort_by?: string | null;
  sort_dir?: 'asc' | 'desc' | null;
  trashed?: string | null;
  page?: number;
  per_page?: number;
}

/**
 * Fetch videos with pagination support using the get_videos_for_api RPC.
 *
 * @param {SupabaseClient} supabase - Supabase client instance
 * @param {GetVideosFilters} filters - Filter options for the query
 *
 * @returns {Promise<GetVideosApiResponse | null>} Videos and pagination metadata, or null on error
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
export const getVideosForApi = async (
  supabase: SupabaseClient,
  filters: GetVideosFilters = {}
): Promise<GetVideosApiResponse | null> => {
  const { data: response, error } = await supabase.rpc('get_videos_for_api', {
    filters: {
      status: filters.status || null,
      search: filters.search || null,
      category: filters.category || null,
      location: filters.location || null,
      trashed: filters.trashed || null,
      sort_by: filters.sort_by || null,
      sort_dir: filters.sort_dir || null,
      page: filters.page || 1,
      per_page: filters.per_page || 50,
    },
  });

  if (error) {
    console.error('Error fetching videos:', error);
    return null;
  }

  return response as GetVideosApiResponse;
};
