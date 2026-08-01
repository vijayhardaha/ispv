import { CATEGORIES } from '@/constants/categories';

import type { VideoEntry } from './videos';

/**
 * Raw video row shape from the Supabase videos table.
 *
 * @type {VideoRow}
 * @property {string} id - Unique identifier for the video.
 * @property {string} video_url - Original Instagram URL.
 * @property {string | null} video_id - Extracted Instagram media ID.
 * @property {string | null} video_src - Source platform name.
 * @property {string[] | null} categories - Category slugs (multiple allowed).
 * @property {string | null} location - State or union territory.
 * @property {string | null} city - City of recording.
 * @property {string[] | null} tags - Searchable tags.
 * @property {string | null} description - Video description text.
 * @property {string | null} thumbnail_url - Thumbnail image URL.
 * @property {string | null} video_post_date - Post date from Instagram.
 * @property {number | null} view_count - Number of views.
 * @property {string} status - Moderation status.
 * @property {string} created_at - Timestamp of record creation.
 * @property {string} updated_at - Timestamp of last update.
 */
export interface VideoRow {
  id: string;
  video_url: string;
  video_id: string | null;
  video_src: string | null;
  categories: string[] | null;
  location: string | null;
  city: string | null;
  tags: string[] | null;
  description: string | null;
  thumbnail_url: string | null;
  video_post_date: string | null;
  view_count: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Maps a raw Supabase video row to a VideoEntry, resolving the first category's
 * display name from the hardcoded CATEGORIES constant.
 *
 * @param {VideoRow} row - Raw row from the videos table.
 *
 * @returns {VideoEntry} Normalized video entry for the frontend.
 */
export function dbRowToVideoEntry(row: VideoRow): VideoEntry {
  const tags = row.tags ?? [];
  const categories = row.categories ?? [];
  const primaryCategory = categories[0] ?? '';
  const matchedCategory = CATEGORIES.find((c) => c.slug === primaryCategory);

  return {
    id: row.id,
    description: row.description ?? '',
    url: row.video_url,
    thumbnail: row.thumbnail_url ?? '',
    city: row.city ?? '',
    location: row.location ?? '',
    categories,
    category: primaryCategory,
    categoryName: matchedCategory?.name ?? primaryCategory,
    tags,
    duration: 0,
    viewCount: row.view_count ?? 0,
    videoPostDate: row.video_post_date,
    createdAt: row.created_at,
    trending: (row.view_count ?? 0) > 1000,
  };
}

/**
 * Maps an array of raw Supabase video rows to VideoEntry objects.
 *
 * @param {VideoRow[]} rows - Raw rows from the videos table.
 *
 * @returns {VideoEntry[]} Normalized video entries for the frontend.
 */
export function dbRowsToVideoEntries(rows: VideoRow[]): VideoEntry[] {
  return rows.map(dbRowToVideoEntry);
}
