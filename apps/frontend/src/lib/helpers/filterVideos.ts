import type { VideoEntry } from '@/lib/videos';

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

/**
 * Sort options array for rendering select/dropdown elements via iteration.
 * Each entry includes the value and human-readable label.
 */
export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'posted_date_desc', label: 'Posted Date (Newest)' },
  { value: 'posted_date_asc', label: 'Posted Date (Newest)' },
  { value: 'created_date_desc', label: 'Created Date (Newest)' },
  { value: 'created_date_asc', label: 'Created Date (Oldest)' },
  { value: 'views_desc', label: 'Trending (High to Low)' },
  { value: 'views_asc', label: 'Trending (Low to High)' },
  { value: 'location_asc', label: 'Location (A-Z)' },
  { value: 'location_desc', label: 'Location (Z-A)' },
  { value: 'city_asc', label: 'City (A-Z)' },
  { value: 'city_desc', label: 'City (Z-A)' },
];

/**
 * Sort comparators keyed by sort option (field + direction).
 */
const SORT_COMPARATORS: Record<SortOption, (a: VideoEntry, b: VideoEntry) => number> = {
  views_desc: (a, b) => b.viewCount - a.viewCount,
  views_asc: (a, b) => a.viewCount - b.viewCount,
  posted_date_desc: (a, b) => {
    if (!a.videoPostDate && !b.videoPostDate) return 0;
    if (!a.videoPostDate) return 1;
    if (!b.videoPostDate) return -1;
    return new Date(b.videoPostDate).getTime() - new Date(a.videoPostDate).getTime();
  },
  posted_date_asc: (a, b) => {
    if (!a.videoPostDate && !b.videoPostDate) return 0;
    if (!a.videoPostDate) return -1;
    if (!b.videoPostDate) return 1;
    return new Date(a.videoPostDate).getTime() - new Date(b.videoPostDate).getTime();
  },
  created_date_desc: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  created_date_asc: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  city_asc: (a, b) => a.city.localeCompare(b.city),
  city_desc: (a, b) => b.city.localeCompare(a.city),
  location_asc: (a, b) => a.location.localeCompare(b.location),
  location_desc: (a, b) => b.location.localeCompare(a.location),
};

/**
 * Filters a list of videos by category, tags, and free-text query, then sorts by the selected option.
 *
 * @param {VideoEntry[]} videos - Videos to filter.
 * @param {FilterState} state - Current filter state.
 *
 * @returns {VideoEntry[]} Filtered and sorted video entries.
 */
export function filterVideos(videos: VideoEntry[], state: FilterState): VideoEntry[] {
  const q = state.query.trim().toLowerCase();
  const comparator = SORT_COMPARATORS[state.sort];

  const filtered = videos.filter((v) => {
    if (state.category !== 'all' && !v.categories.includes(state.category)) {
      return false;
    }

    if (state.location !== 'all' && v.location.toLowerCase() !== state.location.toLowerCase()) {
      return false;
    }

    if (state.tags.length && !state.tags.every((t) => v.tags.includes(t))) {
      return false;
    }

    if (!q) {
      return true;
    }

    return (
      v.description.toLowerCase().includes(q)
      || v.city.toLowerCase().includes(q)
      || v.location.toLowerCase().includes(q)
      || v.tags.some((t) => t.toLowerCase().includes(q))
      || v.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return filtered.sort(comparator);
}
