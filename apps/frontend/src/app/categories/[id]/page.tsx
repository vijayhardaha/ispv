'use client';

import { useEffect, useMemo, useRef, useState, type JSX } from 'react';

import { ArrowLeft, Grid3x3 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import type { FilterState } from '@/components/shared/FilterBar';
import { FilterBar } from '@/components/shared/FilterBar';
import { Pagination } from '@/components/shared/Pagination';
import { VideoCard } from '@/components/shared/VideoCard';
import { Button } from '@/components/ui/Button';
import { getAllVideosFromDb, type VideoEntry } from '@/data/videos';
import { useFilterState } from '@/hooks/useFilterState';
import { useReelPlayer } from '@/hooks/useReelPlayer';
import { getCategories, getCategoryByValue, type DbCategory } from '@/lib/db';

export default function CategoryPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const value = params?.id ?? '';
  const [allVideos, setAllVideos] = useState<VideoEntry[]>([]);
  const [cat, setCat] = useState<DbCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const { play } = useReelPlayer();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    Promise.all([getAllVideosFromDb(), getCategoryByValue(value)]).then(([v, c]) => {
      setAllVideos(v);
      setCat(c);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="font-mono text-xs font-bold text-black/50 uppercase">Loading...</div>
      </div>
    );
  }

  if (!cat) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-extrabold uppercase">Category not found</h1>
        <p className="mt-2 text-black/70">We couldn&apos;t find that category. Try the full list.</p>
        <div className="mt-4">
          <Link href="/categories">
            <Button variant="default">
              <ArrowLeft className="size-4" /> Back to categories
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / state.perPage));
  const safePage = Math.min(state.page, totalPages);
  const paged = filtered.slice((safePage - 1) * state.perPage, safePage * state.perPage);

  return (
    <div>
      <section className="border-b-2 border-black bg-gray-100 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 font-mono text-[10px] font-bold tracking-widest text-black/60 uppercase hover:text-black"
          >
            <ArrowLeft className="h-3 w-3" /> All categories
          </Link>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1 border-2 border-black bg-yellow-400 px-2.5 py-0.5 font-mono text-xs font-bold uppercase">
                Category
              </span>
              <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight uppercase md:text-6xl">
                {cat.name}
              </h1>
              <p className="mt-1 max-w-2xl text-black/70">{cat.description}</p>
            </div>
            <Link href="/videos">
              <Button variant="default">
                <Grid3x3 className="size-4" /> View All Videos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <FilterBar state={state} setState={setState} total={filtered.length} allTags={allTags} />
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {paged.map((v) => (
            <VideoCard key={v.id} video={v} onPlay={(video) => play(video, paged)} />
          ))}
        </div>
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onChange={(p) => {
            setState({ ...state, page: p });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </section>
    </div>
  );
}
