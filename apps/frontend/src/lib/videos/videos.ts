import type { SortOption } from '@/lib/helpers/filterVideos';

import { dbRowsToVideoEntries, type VideoRow } from './adapt';
import { supabase } from '../db/supabase';

/**
 * Frontend video record with all fields needed for display and filtering.
 *
 * @type {VideoEntry}
 * @property {string} id - Unique video identifier.
 * @property {string} description - Video description text.
 * @property {string} url - Original Instagram URL.
 * @property {string} thumbnail - Thumbnail image URL.
 * @property {string} city - City where the video was recorded.
 * @property {string} location - State or union territory.
 * @property {string} category - Category value slug.
 * @property {string} categoryName - Resolved category display name.
 * @property {string[]} tags - Searchable tags.
 * @property {number} duration - Video duration in seconds.
 * @property {number} viewCount - Number of video views.
 * @property {string | null} videoPostDate - Post date from Instagram (ISO string).
 * @property {string} createdAt - Timestamp of record creation (ISO string).
 * @property {boolean} [trending] - Whether the video is trending (high view count).
 */
export interface VideoEntry {
  id: string;
  description: string;
  url: string;
  thumbnail: string;
  city: string;
  location: string;
  category: string;
  categoryName: string;
  tags: string[];
  duration: number;
  viewCount: number;
  videoPostDate: string | null;
  createdAt: string;
  trending?: boolean;
}

/**
 * Fetches up to `perCategory` published videos for each given category slug via the
 * get_frontend_category_videos RPC. Uses a LATERAL join for clean per-category limiting.
 *
 * @param {string[]} slugs - Category slugs to fetch videos for.
 * @param {number} [perCategory] - Max videos per category.
 *
 * @returns {Promise<Record<string, VideoEntry[]>>} Map of category slug to video entries.
 */
export async function getCategorySectionVideos(
  slugs: string[],
  perCategory = 4
): Promise<Record<string, VideoEntry[]>> {
  if (slugs.length === 0) {
    return {};
  }

  const { data, error } = await supabase.rpc('get_frontend_category_videos', {
    p_slugs: slugs,
    p_per_category: perCategory,
  });

  if (error || !data) {
    return {};
  }

  const result: Record<string, VideoEntry[]> = {};
  for (const [slug, rows] of Object.entries(data as Record<string, unknown[]>)) {
    result[slug] = dbRowsToVideoEntries(rows as unknown as VideoRow[]);
  }

  return result;
}

/**
 * Filter parameters for the published-videos paginated query.
 *
 * @type {VideoFilters}
 * @property {string} [category] - Filter by category slug.
 * @property {string} [location] - Filter by location slug.
 * @property {string} [tag] - Filter by single tag.
 * @property {string} [query] - Free-text search.
 * @property {SortOption} [sort] - Sort order.
 * @property {number} [page] - Page number (1-based).
 * @property {number} [perPage] - Items per page.
 */
export interface VideoFilters {
  category?: string;
  location?: string;
  tag?: string;
  query?: string;
  sort?: SortOption;
  page?: number;
  perPage?: number;
}

/**
 * Fetches a paginated, filtered page of published videos via the get_frontend_videos RPC.
 *
 * @param {VideoFilters} [filters] - Filter, sort, and pagination params.
 *
 * @returns {Promise<{ videos: VideoEntry[]; total: number }>} Videos for the current page and total count.
 */
export async function getPublishedVideos(filters: VideoFilters = {}): Promise<{ videos: VideoEntry[]; total: number }> {
  const { data, error } = await supabase.rpc('get_frontend_videos', {
    p_category: filters.category && filters.category !== 'all' ? filters.category : null,
    p_location: filters.location && filters.location !== 'all' ? filters.location : null,
    p_tag: filters.tag ?? null,
    p_query: filters.query?.trim() || null,
    p_sort: filters.sort ?? 'posted_date_desc',
    p_page: filters.page ?? 1,
    p_per_page: filters.perPage ?? 72,
  });

  if (error || !data) {
    return { videos: [], total: 0 };
  }

  return { videos: dbRowsToVideoEntries((data.videos ?? []) as unknown as VideoRow[]), total: data.total ?? 0 };
}
