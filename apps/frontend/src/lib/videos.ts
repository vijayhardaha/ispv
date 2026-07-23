import { dbRowsToVideoEntries, type VideoRow } from '@/lib/adapt';
import { supabase } from '@/lib/supabase';

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
 * @property {string[]} hashtags - Hashtags with hash prefix.
 * @property {number} duration - Video duration in seconds.
 * @property {number} viewCount - Number of video views.
 * @property {boolean} [featured] - Whether the video is featured on the homepage.
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
  hashtags: string[];
  duration: number;
  viewCount: number;
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
    .select('*')
    .eq('status', 'published')
    .order('video_post_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('[videos] Supabase fetch failed:', error?.message);
    return [];
  }

  return dbRowsToVideoEntries(data as unknown as VideoRow[]);
}
