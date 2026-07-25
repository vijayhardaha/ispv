export type { VideoRecord } from './schemas';

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
 * @type {GetVideosApiResponse}
 * @property {import('./schemas').VideoRecord[]} data - Array of video records from the query.
 * @property {PaginationMeta} pagination - Pagination metadata for the result set.
 */
export interface GetVideosApiResponse {
  data: import('./schemas').VideoRecord[];
  pagination: PaginationMeta;
}
