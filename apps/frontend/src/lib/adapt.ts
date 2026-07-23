import type { VideoEntry } from '@/data/videos';

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
    url: row.ig_url,
    thumbnail: row.thumbnail_url ?? '',
    city: row.city ?? '',
    state: row.state ?? '',
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
