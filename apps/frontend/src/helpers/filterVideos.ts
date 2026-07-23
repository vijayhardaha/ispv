import type { FilterState } from '@/components/shared/FilterBar';
import type { VideoEntry } from '@/data/videos';

/**
 * Filters a list of videos by category, tags, and free-text query.
 *
 * @param {VideoEntry[]} videos - Videos to filter.
 * @param {FilterState} state - Current filter state.
 *
 * @returns {VideoEntry[]} Filtered video entries matching all active filters.
 */
export function filterVideos(videos: VideoEntry[], state: FilterState): VideoEntry[] {
  const q = state.query.trim().toLowerCase();
  return videos.filter((v) => {
    if (state.category !== 'all' && v.category !== state.category) return false;
    if (state.location !== 'all' && v.state.toLowerCase() !== state.location.toLowerCase()) return false;
    if (state.tags.length && !state.tags.every((t) => v.tags.includes(t))) return false;
    if (!q) return true;
    return (
      v.description.toLowerCase().includes(q)
      || v.city.toLowerCase().includes(q)
      || v.state.toLowerCase().includes(q)
      || v.hashtags.some((h) => h.toLowerCase().includes(q))
      || v.tags.some((t) => t.toLowerCase().includes(q))
    );
  });
}
