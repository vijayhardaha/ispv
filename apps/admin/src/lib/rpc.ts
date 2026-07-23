/**
 * Utility functions for interacting with the Supabase RPC layer.
 * Handles the new pagination-aware RPC response format.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { GetVideosApiResponse } from './types';

/**
 * Filters object for get_videos_for_api RPC.
 *
 * @typedef {object} GetVideosFilters
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
