'use client';

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';

import { useSearchParams } from 'next/navigation';

import { filterVideos } from '@/helpers/filterVideos';
import type { FilterState } from '@/lib/frontend-schemas';
import type { VideoEntry } from '@/lib/videos';

/**
 * Default filter state used when no URL params or overrides are provided.
 */
const DEFAULT_STATE: FilterState = {
  query: '',
  category: 'all',
  location: 'all',
  tags: [],
  page: 1,
  perPage: 72,
  sort: 'views',
};

/**
 * Configuration options for the useFilterState hook.
 *
 * @type {UseFilterStateProps}
 * @property {VideoEntry[]} videos - Full list of videos to filter.
 * @property {Partial<FilterState>} [defaults] - Default filter values to override initial state.
 */
export interface UseFilterStateProps {
  videos: VideoEntry[];
  defaults?: Partial<FilterState>;
}

/**
 * Manages filter state for the video archive, syncing with URL search params.
 *
 * @param {object} props - Hook options.
 * @param {VideoEntry[]} props.videos - Full list of videos to filter.
 * @param {Partial<FilterState>} [props.defaults] - Default filter values to override initial state.
 *
 * @returns {{ state: FilterState; setState: (s: FilterState) => void; filtered: VideoEntry[]; total: number }} Filter state, setter, filtered results, and total count.
 */
export function useFilterState({ videos, defaults }: UseFilterStateProps): {
  state: FilterState;
  setState: Dispatch<SetStateAction<FilterState>>;
  filtered: VideoEntry[];
  total: number;
} {
  const searchParams = useSearchParams();
  const [state, setState] = useState<FilterState>(() => ({
    ...DEFAULT_STATE,
    ...defaults,
    query: searchParams?.get('q') ?? defaults?.query ?? '',
    category: searchParams?.get('category') ?? defaults?.category ?? 'all',
    location: searchParams?.get('location') ?? defaults?.location ?? 'all',
    tags: searchParams?.get('tag') ? [searchParams.get('tag')!] : (defaults?.tags ?? []),
  }));

  useEffect(() => {
    const next = new URLSearchParams();
    if (state.query) {
      next.set('q', state.query);
    }
    if (state.category !== 'all') {
      next.set('category', state.category);
    }
    if (state.location !== 'all') {
      next.set('location', state.location);
    }
    if (state.tags.length) {
      next.set('tag', state.tags[0]);
    }
    if (state.page !== 1) {
      next.set('page', String(state.page));
    }
    window.history.replaceState(null, '', `?${next.toString()}`);
  }, [state]);

  const filtered = useMemo(() => filterVideos(videos, state), [videos, state]);
  const total = filtered.length;

  return { state, setState, filtered, total };
}
