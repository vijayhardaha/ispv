'use client';

import { useState, useCallback } from 'react';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { usePagination } from '@/hooks/usePagination';
import { getVideosForApi } from '@/lib/rpc';
import { createClient } from '@/lib/supabase';
import type { VideoRecord } from '@/lib/types';

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
 * @property {number} page - Current page number.
 * @property {(page: number) => void} goToPage - Navigate to a specific page.
 * @property {string} status - Current status filter value.
 * @property {string} search - Current search query.
 * @property {(newStatus: string) => void} setStatus - Updates the status filter.
 * @property {() => void} handleReset - Clears all filters.
 * @property {() => void} loadData - Reload videos from the server.
 */
export interface UseVideosLoaderReturn {
  videos: VideoRecord[];
  totalCount: number;
  isTrashed: boolean;
  totalPages: number;
  page: number;
  goToPage: (page: number) => void;
  status: string;
  search: string;
  setStatus: (newStatus: string) => void;
  handleReset: () => void;
  loadData: () => void;
}

/**
 * Manages video data loading, filtering, and pagination.
 *
 * @returns {UseVideosLoaderReturn} Videos, pagination state, and filter controls.
 */
export function useVideosLoader(): UseVideosLoaderReturn {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const supabase = createClient();
  const { page, goToPage } = usePagination();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || '';
  const search = searchParams.get('q') || '';
  const isTrashed = status === 'trashed';

  const setStatus = useCallback(
    (newStatus: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newStatus) {
        params.set('status', newStatus);
      } else {
        params.delete('status');
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

  const loadTrashedVideos = useCallback(async () => {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .not('trashed_at', 'is', null)
      .order('trashed_at', { ascending: false });
    setVideos((data ?? []) as VideoRecord[]);
    setTotalCount(data?.length ?? 0);
  }, [supabase]);

  const loadNormalVideos = useCallback(
    async (st: string, srch: string, pg: number) => {
      const response = await getVideosForApi(supabase, {
        status: st || null,
        search: srch || null,
        page: pg,
        per_page: PER_PAGE,
      });
      if (response) {
        setVideos(response.data);
        setTotalCount(response.pagination.total_count);
      }
    },
    [supabase]
  );

  const loadData = useCallback(() => {
    if (isTrashed) {
      loadTrashedVideos();
    } else {
      loadNormalVideos(status, search, page);
    }
  }, [isTrashed, status, search, page, loadTrashedVideos, loadNormalVideos]);

  const totalPages = isTrashed ? 1 : Math.ceil(totalCount / PER_PAGE);

  return {
    videos,
    totalCount,
    isTrashed,
    totalPages,
    page,
    goToPage,
    status,
    search,
    setStatus,
    handleReset,
    loadData,
  };
}
