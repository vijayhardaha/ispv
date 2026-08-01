import { CATEGORIES } from '@/constants/categories';
import type { VideoEntry } from '@/lib/videos';

/** Maximum number of category badges shown before collapsing. */
const MAX_CATEGORY_BADGES = 2;

/**
 * Result of resolving a video's category badges.
 *
 * @type {CategoryBadges}
 * @property {string[]} visibleCategories - Category names shown before collapsing.
 * @property {number} extraCount - Number of categories hidden beyond the limit.
 */
export interface CategoryBadges {
  visibleCategories: string[];
  extraCount: number;
}

/**
 * Resolves a video's category names and truncates them to the badge limit.
 * Unmatched slugs fall back to the slug itself and empty names are dropped.
 *
 * @param {VideoEntry} video - Video entry to resolve categories for.
 *
 * @returns {CategoryBadges} Visible category names and hidden count.
 */
export function getCategoryBadges(video: VideoEntry): CategoryBadges {
  const categoryNames = video.categories
    .map((slug) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug)
    .filter(Boolean);
  const visibleCategories = categoryNames.slice(0, MAX_CATEGORY_BADGES);
  const extraCount = categoryNames.length - visibleCategories.length;

  return { visibleCategories, extraCount };
}
