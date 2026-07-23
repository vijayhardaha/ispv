import type { VideoEntry } from '@/lib/videos';

/**
 * Raw video row shape from the Supabase videos table with joined category data.
 *
 * @type {VideoRow}
 * @property {string} id - Unique identifier for the video.
 * @property {string} video_url - Original Instagram URL.
 * @property {string | null} video_id - Extracted Instagram media ID.
 * @property {string | null} video_src - Source platform name.
 * @property {string | null} category - Category value reference.
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
 * @property {{ name: string; color: string } | null} categories - Joined category name and colour.
 */
export interface VideoRow {
  id: string;
  video_url: string;
  video_id: string | null;
  video_src: string | null;
  category: string | null;
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
  categories: { name: string; color: string } | null;
}

/**
 * Maps a raw Supabase video row (with joined category data) to a VideoEntry.
 *
 * @param {VideoRow} row - Raw row from the videos table.
 *
 * @returns {VideoEntry} Normalized video entry for the frontend.
 */
export function dbRowToVideoEntry(row: VideoRow): VideoEntry {
  const tags = row.tags ?? [];
  const hashtags = Array.from(
    new Set([...tags.map((t: string) => `#${t}`), row.city ? `#${row.city.replace(/\s+/g, '')}` : ''].filter(Boolean))
  );

  return {
    id: row.id,
    description: row.description ?? '',
    url: row.video_url,
    thumbnail: row.thumbnail_url ?? '',
    city: row.city ?? '',
    location: row.location ?? '',
    category: row.category ?? '',
    categoryName: row.categories?.name ?? row.category ?? '',
    tags,
    hashtags,
    duration: 0,
    featured: (row.view_count ?? 0) > 1000,
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
