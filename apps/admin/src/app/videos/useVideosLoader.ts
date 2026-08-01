'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { STATUSES } from '@/constants/status';
import { usePagination } from '@/hooks/usePagination';
import { getVideosForApi, createClient } from '@/lib/db';
import type { VideoRecord } from '@/lib/db';

/** Number of videos displayed per page in the table. */
const PER_PAGE = 15;

/**
 * Raw response shape from the get_dashboard_stats RPC.
 *
 * @type {DashboardStats}
 * @property {number} total_videos - Total number of videos including trashed.
 * @property {number} trashed_count - Number of trashed videos.
 * @property {{ status: string; count: number }[]} status_counts - Per-status counts excluding trashed.
 */
interface DashboardStats {
  total_videos: number;
  trashed_count: number;
  status_counts: { status: string; count: number }[];
}

/**
 * Per-status video counts for the status tab navigation.
 *
 * @type {StatusCount}
 * @property {string} status - Status value; empty string represents "All".
 * @property {number} count - Number of videos in this status.
 */
export interface StatusCount {
  status: string;
  count: number;
}

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
 * @property {StatusCount[]} statusCounts - Per-status counts for tab navigation.
 * @property {(category: string, location: string) => void} applyFilters - Applies category and location filters in one URL update.
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
  statusCounts: StatusCount[];
  applyFilters: (category: string, location: string) => void;
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
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);
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

  // Fetch per-status counts once on mount for the status tab navigation.
  useEffect(() => {
    let cancelled = false;
    supabase
      .rpc('get_dashboard_stats')
      .then(({ data, error }: { data: DashboardStats | null; error: unknown }) => {
        if (error || cancelled || !data) {
          return;
        }
        const stats = data as DashboardStats;
        const countsMap = Object.fromEntries(stats.status_counts.map((s) => [s.status, s.count]));
        const allCount = Math.max(0, stats.total_videos - stats.trashed_count);
        setStatusCounts([
          { status: '', count: allCount },
          ...STATUSES.filter((s) => s !== '' && s !== 'trashed').map((s) => ({ status: s, count: countsMap[s] ?? 0 })),
          { status: 'trashed', count: stats.trashed_count },
        ]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [supabase]);

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

  const applyFilters = useCallback(
    (newCategory: string, newLocation: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newCategory) {
        params.set('category', newCategory);
      } else {
        params.delete('category');
      }
      if (newLocation) {
        params.set('location', newLocation);
      } else {
        params.delete('location');
      }
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
    statusCounts,
    applyFilters,
    setSort,
    handleReset,
    loadData,
  };
}
