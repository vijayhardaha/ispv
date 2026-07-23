'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { FilterState } from '@/lib/schemas';
import { useFilterState } from '@/hooks/useFilterState';
import { useReelPlayer } from '@/hooks/useReelPlayer';
import { getAllVideosFromDb, type VideoEntry } from '@/lib/videos';
import { getCategoryByValue, getLocations, type DbCategory } from '@/lib/db';

export interface CategoryPageData {
  value: string;
  cat: DbCategory | null;
  allLocations: string[];
  allTags: string[];
  loading: boolean;
}

export interface CategoryPageFilter {
  state: FilterState;
  setState: React.Dispatch<React.SetStateAction<FilterState>>;
  total: number;
  totalPages: number;
  safePage: number;
  paged: VideoEntry[];
}

export function useCategoryPage(
  value: string
): CategoryPageData & { filters: CategoryPageFilter; play: ReturnType<typeof useReelPlayer>['play'] } {
  const [allVideos, setAllVideos] = useState<VideoEntry[]>([]);
  const [cat, setCat] = useState<DbCategory | null>(null);
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { play } = useReelPlayer();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    Promise.all([getAllVideosFromDb(), getCategoryByValue(value), getLocations()]).then(([v, c, locs]) => {
      setAllVideos(v);
      setCat(c);
      setAllLocations(locs.map((l) => l.name));
      setLoading(false);
    });
  }, [value]);

  const all = useMemo(() => (cat ? allVideos.filter((v) => v.category === cat.value) : []), [allVideos, cat]);

  const allTags = useMemo(() => Array.from(new Set(allVideos.flatMap((v) => v.tags))).sort(), [allVideos]);

  const { state, setState, filtered } = useFilterState({ videos: all, defaults: { category: value, perPage: 12 } });

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
