import { z } from 'zod/v4';

/**
 * Zod schema validating the public video submission form.
 */
export const submitVideoFormSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  location: z.string().min(1, 'Location is required'),
  city: z.string().max(30, 'City must be 30 characters or less'),
  hashtags: z.string(),
});

/**
 * Inferred type from the submit-video form schema.
 *
 * @type {SubmitVideoForm}
 */
export type SubmitVideoForm = z.infer<typeof submitVideoFormSchema>;

/**
 * Sort options for video archive results, including direction.
 *
 * @type {SortOption}
 */
export type SortOption =
  | 'views_desc'
  | 'views_asc'
  | 'posted_date_desc'
  | 'posted_date_asc'
  | 'created_date_desc'
  | 'created_date_asc'
  | 'city_asc'
  | 'city_desc'
  | 'location_asc'
  | 'location_desc';

/**
 * Filter state for the video archive search and filtering.
 *
 * @type {FilterState}
 * @property {string} query - Free-text search query string.
 * @property {string} category - Selected category slug filter.
 * @property {string} location - Selected location slug filter.
 * @property {string[]} tags - Active tag filters.
 * @property {number} page - Current page number (1-based).
 * @property {number} perPage - Number of items per page.
 * @property {SortOption} sort - Current sort order for results.
 */
export interface FilterState {
  query: string;
  category: string;
  location: string;
  tags: string[];
  page: number;
  perPage: number;
  sort: SortOption;
}
