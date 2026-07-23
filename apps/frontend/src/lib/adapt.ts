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

export function dbRowsToVideoEntries(rows: VideoRow[]): VideoEntry[] {
  return rows.map(dbRowToVideoEntry);
}
