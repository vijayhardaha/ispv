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
 * @property {string | null} [trashed_at] - Timestamp when video was moved to trash (soft delete).
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
  trashed_at?: string | null;
}

/**
 * Pagination metadata returned by get_videos_for_api RPC.
 *
 * @type {PaginationMeta}
 * @property {number} page - Current page number (1-based).
 * @property {number} per_page - Number of items per page.
 * @property {number} total_count - Total number of items across all pages.
 * @property {number} total_pages - Total number of pages.
 * @property {boolean} has_next - Whether a next page exists.
 * @property {boolean} has_previous - Whether a previous page exists.
 */
export interface PaginationMeta {
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

/**
 * Response structure from get_videos_for_api RPC.
 *
 * @type {GetVideosApiResponse}
 * @property {VideoRecord[]} data - Array of video records.
 * @property {PaginationMeta} pagination - Pagination metadata.
 */
export interface GetVideosApiResponse {
  data: VideoRecord[];
  pagination: PaginationMeta;
}
