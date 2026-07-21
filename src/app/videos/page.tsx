'use client';

import { useEffect, useMemo, useState, Suspense, type JSX } from 'react';

import { useSearchParams } from 'next/navigation';

import { FilterBar, type FilterState } from '@/components/filters/FilterBar';
import { Pagination } from '@/components/filters/Pagination';
import { ReelPlayer } from '@/components/videos/ReelPlayer';
import { VideoCard } from '@/components/videos/VideoCard';
import { VIDEOS, type VideoEntry, type SortKey, type VideoCategory } from '@/data/videos';

/**
 * Default filter state for the videos page.
 */
const DEFAULT_STATE: FilterState = { query: '', sort: 'newest', category: 'all', tags: [], page: 1, perPage: 36 };

/**
 * Full video archive page with search, filters, grid/list view, and pagination.
 *
 * @returns {JSX.Element} Rendered videos page with Suspense wrapper.
 */
export default function VideosPage(): JSX.Element {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100" />}>
      <VideosPageInner />
    </Suspense>
  );
}

function VideosPageInner() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<FilterState>(() => ({
    ...DEFAULT_STATE,
    query: searchParams?.get('q') ?? '',
    category: (searchParams?.get('category') as VideoCategory) ?? 'all',
  }));
  const [active, setActive] = useState<VideoEntry | null>(null);

  useEffect(() => {
    const next = new URLSearchParams();
    if (state.query) next.set('q', state.query);
    if (state.category !== 'all') next.set('category', state.category);
    if (state.sort !== 'newest') next.set('sort', state.sort);
    if (state.page !== 1) next.set('page', String(state.page));
    window.history.replaceState(null, '', `?${next.toString()}`);
  }, [state]);

  const filtered = useMemo(() => {
    const q = state.query.trim().toLowerCase();
    return VIDEOS.filter((v) => {
      if (state.category !== 'all' && v.category !== state.category) return false;
      if (state.tags.length && !state.tags.every((t) => v.tags.includes(t))) return false;
      if (!q) return true;
      return (
        v.title.toLowerCase().includes(q)
        || v.description.toLowerCase().includes(q)
        || v.city.toLowerCase().includes(q)
        || v.state.toLowerCase().includes(q)
        || v.hashtags.some((h) => h.toLowerCase().includes(q))
        || v.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [state]);

  const sorted = useMemo(() => sortVideos(filtered, state.sort), [filtered, state.sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / state.perPage));
  const safePage = Math.min(state.page, totalPages);
  const paged = sorted.slice((safePage - 1) * state.perPage, safePage * state.perPage);

  return (
    <div className="bg-gray-100">
      {/* Hero band */}
      <section className="border-b-[3px] border-black bg-[#0a0a0c] py-10 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="font-mono text-[10px] tracking-widest text-orange-600 uppercase">/ All Videos</div>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight uppercase md:text-6xl">
            The Full Archive
          </h1>
          <p className="mt-2 max-w-2xl text-white/80">
            Every reel we have on file. Use the search, sort, and tags to narrow it down. Click any card to open the
            snap-scroll player.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <FilterBar state={state} setState={setState} total={sorted.length} />

        <div className="mt-6 flex items-center justify-between">
          <div className="font-mono text-[10px] tracking-widest text-black/60 uppercase">
            Page {safePage} of {totalPages} · {sorted.length} videos
          </div>
        </div>

        {paged.length === 0 ? (
          <div className="mt-10 border-[3px] border-dashed border-black/40 p-12 text-center">
            <div className="font-display text-2xl font-extrabold uppercase">Nothing matched</div>
            <p className="mt-1 text-black/60">Try a different search term, fewer tags, or a different sort.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {paged.map((v) => (
              <VideoCard key={v.id} video={v} onPlay={setActive} />
            ))}
          </div>
        )}

        <Pagination
          page={safePage}
          totalPages={totalPages}
          onChange={(p) => {
            setState({ ...state, page: p });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </section>

      <ReelPlayer
        open={!!active}
        startIndex={active ? paged.findIndex((v) => v.id === active.id) : 0}
        videos={paged.length ? paged : sorted}
        onClose={() => setActive(null)}
      />
    </div>
  );
}

function sortVideos(videos: VideoEntry[], sort: SortKey): VideoEntry[] {
  const arr = [...videos];
  switch (sort) {
    case 'newest':
      return arr.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    case 'oldest':
      return arr.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
    case 'most-viewed':
      return arr.sort((a, b) => b.views - a.views);
    case 'most-liked':
      return arr.sort((a, b) => b.likes - a.likes);
    case 'title-az':
      return arr.sort((a, b) => a.title.localeCompare(b.title));
    case 'title-za':
      return arr.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return arr;
  }
}
