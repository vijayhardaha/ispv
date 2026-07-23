import { dbRowsToVideoEntries, type VideoRow } from '@/lib/adapt';
import { supabase } from '@/lib/supabase';

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
  hashtags: string[];
  duration: number;
  featured?: boolean;
}

/**
 * Fetches all published videos from Supabase with joined category data.
 *
 * @returns {Promise<VideoEntry[]>} Array of published video entries.
 */
export async function getAllVideosFromDb(): Promise<VideoEntry[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*, categories(name, color)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('[videos] Supabase fetch failed:', error?.message);
    return [];
  }

  return dbRowsToVideoEntries(data as unknown as VideoRow[]);
}
