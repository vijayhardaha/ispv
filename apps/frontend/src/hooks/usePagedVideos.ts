'use client';

import { useEffect, useState } from 'react';

import type { FilterState } from '@/lib/helpers/filterVideos';
import { getPublishedVideos, type VideoEntry } from '@/lib/videos';

/**
 * Return type of the usePagedVideos hook.
 *
 * @type {UsePagedVideosReturn}
 * @property {VideoEntry[]} paged - Videos for the current page slice.
 * @property {number} total - Total number of filtered videos.
 * @property {boolean} loading - Whether the fetch is still in progress.
 */
export interface UsePagedVideosReturn {
  paged: VideoEntry[];
  total: number;
  loading: boolean;
}

/**
 * Fetches the published videos matching the given filter state.
 * Refetches whenever the state changes and cancels stale requests.
 *
 * @param {FilterState} state - Current filter values read from the URL.
 *
 * @returns {UsePagedVideosReturn} Paged videos, total count, and loading flag.
 */
export function usePagedVideos(state: FilterState): UsePagedVideosReturn {
  const [paged, setPaged] = useState<VideoEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPublishedVideos({
      category: state.category,
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
  }, [state]);

  return { paged, total, loading };
}
