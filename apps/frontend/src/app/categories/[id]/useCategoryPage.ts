'use client';

import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';

import { useFilterState } from '@/hooks/useFilterState';
import { useReelPlayer } from '@/hooks/useReelPlayer';
import { getCategoryByValue, getLocations, type DbCategory } from '@/lib/db';
import type { FilterState } from '@/lib/frontend-schemas';
import { getAllVideosFromDb, type VideoEntry } from '@/lib/videos';

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
 * @property {FilterState} state - Current filter values.
 * @property {(value: FilterState | ((prev: FilterState) => FilterState)) => void} setState - Updates the filter state.
 * @property {number} total - Total number of filtered videos.
 * @property {number} totalPages - Total number of paginated pages.
 * @property {number} safePage - Current page clamped to valid range.
 * @property {VideoEntry[]} paged - Videos for the current page slice.
 */
export interface CategoryPageFilter {
  state: FilterState;
  setState: Dispatch<SetStateAction<FilterState>>;
  total: number;
  totalPages: number;
  safePage: number;
  paged: VideoEntry[];
}

/**
 * Manages category page data fetching, filtering, and pagination state.
 *
 * @param {string} value - Category slug from the URL.
 *
 * @returns {CategoryPageData & { filters: CategoryPageFilter; play: ReturnType<typeof useReelPlayer>['play'] }} Category data, filter state, and reel player.
 */
export function useCategoryPage(
  value: string
): CategoryPageData & { filters: CategoryPageFilter; play: ReturnType<typeof useReelPlayer>['play'] } {
  const [allVideos, setAllVideos] = useState<VideoEntry[]>([]);
  const [cat, setCat] = useState<DbCategory | null>(null);
  const [allLocations, setAllLocations] = useState<{ slug: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { play } = useReelPlayer();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) {
      return;
    }
    loaded.current = true;
    Promise.all([getAllVideosFromDb(), getCategoryByValue(value), getLocations()]).then(([v, c, locs]) => {
      setAllVideos(v);
      setCat(c);
      setAllLocations(locs.map((l) => ({ slug: l.slug, name: l.name })));
      setLoading(false);
    });
  }, [value]);

  const all = useMemo(() => (cat ? allVideos.filter((v) => v.category === cat.slug) : []), [allVideos, cat]);

  const allTags = useMemo(() => Array.from(new Set(allVideos.flatMap((v) => v.tags))).sort(), [allVideos]);

  const { state, setState, filtered } = useFilterState({ videos: all, defaults: { category: value, perPage: 72 } });

  useEffect(() => {
    if (value && value !== state.category) {
      setState((s: FilterState) => ({ ...s, category: value, page: 1 }));
    }
  }, [value, setState, state.category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / state.perPage));
  const safePage = Math.min(state.page, totalPages);
  const paged = filtered.slice((safePage - 1) * state.perPage, safePage * state.perPage);

  return {
    value,
    cat,
    allLocations,
    allTags,
    loading,
    filters: { state, setState, total: filtered.length, totalPages, safePage, paged },
    play,
  };
}
