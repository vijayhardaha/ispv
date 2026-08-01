'use client';

import { useState, useCallback, useMemo } from 'react';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { usePagination } from '@/hooks/usePagination';
import { getVideosForApi, createClient } from '@/lib/db';
import type { VideoRecord } from '@/lib/db';

/** Number of videos displayed per page in the table. */
const PER_PAGE = 15;

/**
 * Return type of the useVideosLoader hook.
 *
 * @type {UseVideosLoaderReturn}
 * @property {VideoRecord[]} videos - Current page of videos.
 * @property {number} totalCount - Total video count across all pages.
 * @property {boolean} isTrashed - Whether the trashed filter is active.
 * @property {number} totalPages - Total number of pages.
 * @property {number} perPage - Number of videos displayed per page.
 * @property {number} page - Current page number.
 * @property {string} status - Current status filter value.
 * @property {string} search - Current search query.
 * @property {string} category - Current category filter value.
 * @property {string} location - Current location filter value.
 * @property {string} sort - Current sort column key.
 * @property {'asc' | 'desc'} dir - Current sort direction.
 * @property {(newStatus: string) => void} setStatus - Updates the status filter.
 * @property {(newCategory: string) => void} setCategory - Updates the category filter.
 * @property {(newLocation: string) => void} setLocation - Updates the location filter.
 * @property {(column: string) => void} setSort - Updates the sort column and toggles direction.
 * @property {() => void} handleReset - Clears all filters.
 * @property {() => void} loadData - Reload videos from the server.
 */
export interface UseVideosLoaderReturn {
  videos: VideoRecord[];
  totalCount: number;
  isTrashed: boolean;
  totalPages: number;
  perPage: number;
  page: number;
  status: string;
  search: string;
  category: string;
  location: string;
  sort: string;
  dir: 'asc' | 'desc';
  setStatus: (newStatus: string) => void;
  setCategory: (newCategory: string) => void;
  setLocation: (newLocation: string) => void;
  setSort: (column: string) => void;
  handleReset: () => void;
  loadData: () => void;
}

/**
 * Manages video data loading, filtering, sorting, and pagination.
 * All filter state is read from URL search params so the page reloads
 * data from the URL instead of local state.
 *
 * @returns {UseVideosLoaderReturn} Videos, pagination state, and filter controls.
 */
export function useVideosLoader(): UseVideosLoaderReturn {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const supabase = useMemo(() => createClient(), []);
  const { page } = usePagination();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || '';
  const search = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const location = searchParams.get('location') || '';
  const sort = searchParams.get('sort') || '';
  const dir = searchParams.get('dir') === 'asc' ? 'asc' : 'desc';
  const isTrashed = status === 'trashed';

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

  const setStatus = useCallback((newStatus: string) => setFilter('status', newStatus), [setFilter]);
  const setCategory = useCallback((newCategory: string) => setFilter('category', newCategory), [setFilter]);
  const setLocation = useCallback((newLocation: string) => setFilter('location', newLocation), [setFilter]);

  const setSort = useCallback(
    (column: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentSort = searchParams.get('sort') || '';
      const currentDir = searchParams.get('dir') === 'asc' ? 'asc' : 'desc';
      const nextDir = currentSort === column && currentDir === 'asc' ? 'desc' : 'asc';
      params.set('sort', column);
      params.set('dir', nextDir);
      params.delete('page');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );

  const handleReset = useCallback(() => {
    router.replace(pathname);
  }, [router, pathname]);

  const loadData = useCallback(async () => {
    const response = await getVideosForApi(supabase, {
      status: isTrashed ? null : status || null,
      search: search || null,
      category: category || null,
      location: location || null,
      sort_by: sort || null,
      sort_dir: dir,
      page,
      per_page: PER_PAGE,
      trashed: isTrashed ? 'only' : null,
    });
    if (response) {
      setVideos(response.data);
      setTotalCount(response.pagination.total_count);
    }
  }, [isTrashed, status, search, category, location, sort, dir, page, supabase]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));

  return {
    videos,
    totalCount,
    isTrashed,
    totalPages,
    perPage: PER_PAGE,
    page,
    status,
    search,
    category,
    location,
    sort,
    dir,
    setStatus,
    setCategory,
    setLocation,
    setSort,
    handleReset,
    loadData,
  };
}
