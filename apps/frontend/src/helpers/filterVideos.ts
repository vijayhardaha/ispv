import type { FilterState, SortOption } from '@/lib/frontend-schemas';
import type { VideoEntry } from '@/lib/videos';

/**
 * Sort comparators keyed by sort option.
 */
const SORT_COMPARATORS: Record<SortOption, (a: VideoEntry, b: VideoEntry) => number> = {
  views: (a, b) => b.viewCount - a.viewCount,
  posted_date: (a, b) => {
    if (!a.videoPostDate && !b.videoPostDate) {
      return 0;
    }
    if (!a.videoPostDate) {
      return 1;
    }
    if (!b.videoPostDate) {
      return -1;
    }
    return new Date(b.videoPostDate).getTime() - new Date(a.videoPostDate).getTime();
  },
  created_date: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  city: (a, b) => a.city.localeCompare(b.city),
  location: (a, b) => a.location.localeCompare(b.location),
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
    if (state.category !== 'all' && v.category !== state.category) {
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
      || v.hashtags.some((h) => h.toLowerCase().includes(q))
      || v.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return filtered.sort(comparator);
}

/**
 * Human-readable labels for sort options.
 */
export const SORT_LABELS: Record<SortOption, string> = {
  views: 'Views',
  posted_date: 'Posted Date',
  created_date: 'Created Date',
  city: 'City',
  location: 'Location',
};
