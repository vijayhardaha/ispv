'use client';

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

import { useReelPlayer } from '@/hooks/useReelPlayer';
import { getCategoryByValue, getLocations, getTags, type DbCategory } from '@/lib/db';
import type { FilterState } from '@/lib/helpers/filterVideos';
import { getPublishedVideos, type VideoEntry } from '@/lib/videos';

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
 * @property {(value: FilterState) => void} setState - Updates the filter state.
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

const DEFAULT_STATE: FilterState = {
  query: '',
  category: 'all',
  location: 'all',
  tags: [],
  page: 1,
  perPage: 72,
  sort: 'posted_date_desc',
};

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
  const [paged, setPaged] = useState<VideoEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [cat, setCat] = useState<DbCategory | null>(null);
  const [allLocations, setAllLocations] = useState<{ slug: string; name: string }[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<FilterState>(() => ({ ...DEFAULT_STATE, category: value }));
  const { play } = useReelPlayer();
  const loadedStatic = useRef(false);

  useEffect(() => {
    if (!loadedStatic.current) {
      loadedStatic.current = true;
      Promise.all([getCategoryByValue(value), getLocations(), getTags()]).then(([c, locs, tags]) => {
        setCat(c);
        setAllLocations(locs.map((l) => ({ slug: l.slug, name: l.name })));
        setAllTags(tags);
      });
    }

    let cancelled = false;
    getPublishedVideos({
      category: value,
      location: state.location,
      tag: state.tags[0],
      query: state.query,
      sort: state.sort,
      page: state.page,
      perPage: state.perPage,
    }).then((result) => {
      if (cancelled) return;
      setPaged(result.videos);
      setTotal(result.total);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [value, state]);

  const totalPages = Math.max(1, Math.ceil(total / state.perPage));
  const safePage = Math.min(state.page, totalPages);

  return {
    value,
    cat,
    allLocations,
    allTags,
    loading,
    filters: { state, setState, total, totalPages, safePage, paged },
    play,
  };
}
