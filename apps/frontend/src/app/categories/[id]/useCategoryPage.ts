'use client';

import { useEffect, useState } from 'react';

import { useFilterOptions } from '@/hooks/useFilterOptions';
import { useFilterState } from '@/hooks/useFilterState';
import { usePagedVideos } from '@/hooks/usePagedVideos';
import { useReelPlayer } from '@/hooks/useReelPlayer';
import { getCategoryByValue, type DbCategory } from '@/lib/db';
import type { FilterState } from '@/lib/helpers/filterVideos';
import type { VideoEntry } from '@/lib/videos';

/**
 * Data shape for the category page, including category metadata and filter options.
 *
 * @type {CategoryPageData}
 * @property {string} value - Category slug from the URL.
 * @property {DbCategory | null} cat - Category record from the database.
 * @property {{ slug: string; name: string }[]} allLocations - All available locations for filtering.
 * @property {string[]} allTags - All unique tags across videos for filtering.
 * @property {boolean} loading - Whether data is still being fetched.
 */
export interface CategoryPageData {
  value: string;
  cat: DbCategory | null;
  allLocations: { slug: string; name: string }[];
  allTags: string[];
  loading: boolean;
}

/**
 * Filter state and pagination data for the category page video grid.
 *
 * @type {CategoryPageFilter}
 * @property {FilterState} state - Current filter values read from the URL.
 * @property {(param: string, value: string) => void} setFilter - Updates a URL search param and resets page.
 * @property {number} total - Total number of filtered videos.
 * @property {number} totalPages - Total number of paginated pages.
 * @property {number} safePage - Current page clamped to valid range.
 * @property {VideoEntry[]} paged - Videos for the current page slice.
 */
export interface CategoryPageFilter {
  state: FilterState;
  setFilter: (param: string, value: string) => void;
  total: number;
  totalPages: number;
  safePage: number;
  paged: VideoEntry[];
}

/**
 * Manages category page data fetching, filtering, and pagination state.
 * Filters, sort, and pagination are read from and written to URL search params.
 *
 * @param {string} value - Category slug from the URL.
 *
 * @returns {CategoryPageData & { filters: CategoryPageFilter; play: ReturnType<typeof useReelPlayer>['play'] }} Category data, filter state, and reel player.
 */
export function useCategoryPage(
  value: string
): CategoryPageData & { filters: CategoryPageFilter; play: ReturnType<typeof useReelPlayer>['play'] } {
  const [cat, setCat] = useState<DbCategory | null>(null);
  const { state, setFilter } = useFilterState({ category: value });
  const { play } = useReelPlayer();
  const { paged, total, loading } = usePagedVideos(state);
  const { allTags, allLocations } = useFilterOptions();

  useEffect(() => {
    let cancelled = false;
    getCategoryByValue(value).then((c) => {
      if (cancelled) return;
      setCat(c);
    });
    return () => {
      cancelled = true;
    };
  }, [value]);

  const totalPages = Math.max(1, Math.ceil(total / state.perPage));
  const safePage = Math.min(state.page, totalPages);

  return {
    value,
    cat,
    allLocations,
    allTags,
    loading,
    filters: { state, setFilter, total, totalPages, safePage, paged },
    play,
  };
}
