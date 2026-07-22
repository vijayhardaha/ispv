import { CATEGORY_META } from '@/constants/categories';
import type { VideoCategory } from '@/constants/categories';
import type { VideoEntry } from '@/data/videos';

/**
 * Raw video record shape returned by Supabase.
 */
export interface VideoRow {
  id: string;
  ig_url: string;
  ig_id: string | null;
  src: string | null;
  category: string | null;
  state: string | null;
  city: string | null;
  tags: string[] | null;
  description: string | null;
  thumbnail_url: string | null;
  ig_post_date: string | null;
  view_count: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Category metadata from Supabase, joined when querying videos.
 */
export interface CategoryRow {
  name: string | null;
  color: string | null;
}

/**
 * Maps a database video row to a frontend-compatible VideoEntry.
 *
 * @param {VideoRow} row - Raw database row.
 *
 * @returns {VideoEntry} Frontend video entry.
 */
export function dbRowToVideoEntry(row: VideoRow): VideoEntry {
  const tags = row.tags ?? [];
  const cat = (row.category ?? 'marches') as Exclude<VideoCategory, 'all'>;
  const meta = CATEGORY_META[cat] ?? CATEGORY_META.marches;

  // Derive hashtags from tags + category metadata
  const hashtags = Array.from(
    new Set(
      [...tags.map((t: string) => `#${t}`), meta.hashtag, row.city ? `#${row.city.replace(/\s+/g, '')}` : ''].filter(
        Boolean
      )
    )
  );

  return {
    id: row.id,
    description: row.description ?? '',
    url: row.ig_url,
    thumbnail: row.thumbnail_url ?? '',
    city: row.city ?? '',
    state: row.state ?? '',
    category: cat,
    tags,
    hashtags,
    duration: 0, // deprecated — no video player
    featured: (row.view_count ?? 0) > 1000,
  };
}

/**
 * Maps an array of database rows to frontend video entries.
 *
 * @param {VideoRow[]} rows - Raw database rows.
 *
 * @returns {VideoEntry[]} Frontend video entries.
 */
export function dbRowsToVideoEntries(rows: VideoRow[]): VideoEntry[] {
  return rows.map(dbRowToVideoEntry);
}
