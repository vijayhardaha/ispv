/**
 * Video record shape returned by the API or RPC.
 *
 * @type {VideoRecord}
 * @property {string} id - Unique identifier for the video.
 * @property {string} ig_url - Original Instagram URL.
 * @property {string | null} ig_id - Extracted Instagram media ID.
 * @property {string | null} category - Category value reference.
 * @property {string | null} state - State or union territory.
 * @property {string | null} city - City of recording.
 * @property {string[] | null} tags - Searchable tags.
 * @property {string | null} description - Video description text.
 * @property {string | null} thumbnail_url - Thumbnail image URL.
 * @property {string | null} ig_post_date - Post date from Instagram.
 * @property {string} status - Moderation status (draft, pending_review, published, rejected).
 * @property {string} created_at - Timestamp of record creation.
 * @property {string} updated_at - Timestamp of last update.
 * @property {string | null} submitted_tags - Tags provided at submission time.
 * @property {string | null} submitted_category - Category guessed at submission.
 * @property {string | null} submitted_state - State guessed at submission.
 * @property {string | null} submitted_city - City guessed at submission.
 * @property {string | null} category_name - Resolved category display name.
 * @property {string | null} category_color - Resolved category color value.
 * @property {number} view_count - Number of times the video was viewed.
 * @property {number} [total_count] - Total count for pagination, populated by RPC.
 */
export interface VideoRecord {
  id: string;
  ig_url: string;
  ig_id: string | null;
  src: string;
  category: string | null;
  state: string | null;
  city: string | null;
  tags: string[] | null;
  description: string | null;
  thumbnail_url: string | null;
  ig_post_date: string | null;
  status: 'draft' | 'pending_review' | 'published' | 'rejected';
  created_at: string;
  updated_at: string;
  submitted_tags: string | null;
  submitted_category: string | null;
  submitted_state: string | null;
  submitted_city: string | null;
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
 * @property {string | null} seo_title - SEO title override.
 * @property {string | null} seo_description - SEO description override.
 */
export interface CategoryRecord {
  id: string;
  value: string;
  name: string;
  color: string;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

/**
 * Location record from the Supabase locations table.
 *
 * @type {LocationRecord}
 * @property {string} id - Unique identifier for the location.
 * @property {string} value - URL-friendly slug value.
 * @property {string} name - Display name for the location.
 * @property {string | null} description - Short description of the location.
 * @property {string | null} seo_title - SEO title override.
 * @property {string | null} seo_description - SEO description override.
 */
export interface LocationRecord {
  id: string;
  value: string;
  name: string;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
}
