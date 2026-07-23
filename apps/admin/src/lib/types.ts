/**
 * Video record shape returned by the API or RPC.
 *
 * @type {VideoRecord}
 * @property {string} id - Unique identifier for the video.
 * @property {string} video_url - Original Instagram URL.
 * @property {string | null} video_id - Extracted Instagram media ID.
 * @property {string} video_src - Source platform.
 * @property {string | null} category - Category value reference.
 * @property {string | null} location - State or union territory.
 * @property {string | null} city - City of recording.
 * @property {string[] | null} tags - Searchable tags.
 * @property {string | null} description - Video description text.
 * @property {string | null} thumbnail_url - Thumbnail image URL.
 * @property {string | null} video_post_date - Post date from Instagram.
 * @property {string} status - Moderation status (draft, pending_review, published, rejected).
 * @property {string} created_at - Timestamp of record creation.
 * @property {string} updated_at - Timestamp of last update.
 * @property {string | null} category_name - Resolved category display name.
 * @property {string | null} category_color - Resolved category color value.
 * @property {number} view_count - Number of times the video was viewed.
 * @property {number} [total_count] - Total count for pagination, populated by RPC.
 */
export interface VideoRecord {
  id: string;
  video_url: string;
  video_id: string | null;
  video_src: string;
  category: string | null;
  location: string | null;
  city: string | null;
  tags: string[] | null;
  description: string | null;
  thumbnail_url: string | null;
  video_post_date: string | null;
  status: 'draft' | 'pending_review' | 'published' | 'rejected';
  created_at: string;
  updated_at: string;
  category_name: string | null;
  category_color: string | null;
  view_count: number;
  /** Populated by get_videos_for_api RPC via COUNT(*) OVER() */
  total_count?: number;
}

/**
 * Category record from the Supabase categories table.
 *
 * @type {CategoryRecord}
 * @property {string} id - Unique identifier for the category.
 * @property {string} value - URL-friendly slug value.
 * @property {string} name - Display name for the category.
 * @property {string} color - Colour identifier for styling.
 * @property {string | null} description - Short description of the category.
 */
export interface CategoryRecord {
  id: string;
  value: string;
  name: string;
  color: string;
  description: string | null;
}

/**
 * Location record from the Supabase locations table.
 *
 * @type {LocationRecord}
 * @property {string} id - Unique identifier for the location.
 * @property {string} value - URL-friendly slug value.
 * @property {string} name - Display name for the location.
 * @property {string | null} description - Short description of the location.
 */
export interface LocationRecord {
  id: string;
  value: string;
  name: string;
  description: string | null;
}
