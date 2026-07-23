export type { VideoRecord } from '@/lib/schemas';

/**
 * Pagination metadata returned by get_videos_for_api RPC.
 *
 * @property {number} page - Current page number (1-based).
 * @property {number} per_page - Number of items per page.
 * @property {number} total_count - Total number of items across all pages.
 * @property {number} total_pages - Total number of pages.
 * @property {boolean} has_next - Whether a next page exists.
 * @property {boolean} has_previous - Whether a previous page exists.
 */
interface PaginationMeta {
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
 * @property {import('@/lib/schemas').VideoRecord[]} data - Array of video records.
 * @property {PaginationMeta} pagination - Pagination metadata.
 */
export interface GetVideosApiResponse {
  data: import('@/lib/schemas').VideoRecord[];
  pagination: PaginationMeta;
}
