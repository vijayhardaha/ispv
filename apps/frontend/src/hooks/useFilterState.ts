'use client';

import { useCallback, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { SORT_OPTIONS, type FilterState, type SortOption } from '@/lib/helpers/filterVideos';

/**
 * Default filter values used when no URL search param is present.
 */
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
 * Configuration options for the useFilterState hook.
 *
 * @type {UseFilterStateProps}
 * @property {string} [category] - Fixed category slug scoping all results (e.g. from the URL path).
 */
export interface UseFilterStateProps {
  category?: string;
}

/**
 * Manages video filter state driven entirely by URL search params.
 *
 * Reads the `q`, `location`, `tag`, `sort`, and `page` params from the URL,
 * builds a FilterState, and exposes setFilter() which rewrites the URL
 * (resetting pagination). Data fetching must happen in the caller's effect
 * keyed on the returned state.
 *
 * @param {UseFilterStateProps} [props] - Hook options.
 * @param {string} [props.category] - Fixed category slug scoping all results.
 *
 * @returns {{ state: FilterState; setFilter: (param: string, value: string) => void }} URL-derived filter state and URL updater.
 */
export function useFilterState({ category }: UseFilterStateProps = {}): {
  state: FilterState;
  setFilter: (param: string, value: string) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get('q') ?? '';
  const location = searchParams.get('location') ?? 'all';
  const tag = searchParams.get('tag') ?? '';
  const rawSort = searchParams.get('sort');
  const sort = SORT_OPTIONS.some((o) => o.value === rawSort) ? (rawSort as SortOption) : DEFAULT_STATE.sort;
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const state = useMemo<FilterState>(
    () => ({
      query,
      category: category ?? 'all',
      location,
      tags: tag ? [tag] : [],
      page,
      perPage: DEFAULT_STATE.perPage,
      sort,
    }),
    [query, category, location, tag, page, sort]
  );

  const setFilter = useCallback(
    (param: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(param, value);
      } else {
        params.delete(param);
      }
      params.delete('page');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );

  return { state, setFilter };
}
