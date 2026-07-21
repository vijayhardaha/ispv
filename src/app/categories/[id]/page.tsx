"use client";

import { useEffect, useMemo, useState, type JSX } from "react";

import { ArrowLeft, Grid3x3 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { FilterBar, type FilterState } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";
import { Button } from "@/components/ui/Button";
import { ReelPlayer } from "@/components/videos/ReelPlayer";
import { VideoCard } from "@/components/videos/VideoCard";
import { CATEGORIES, VIDEOS, type VideoCategory, type VideoEntry } from "@/data/videos";

export default function CategoryPage(): JSX.Element {
  const params = useParams<{ id: VideoCategory }>();
  const id = params?.id;
  const cat = CATEGORIES.find((c) => c.id === id);
  const all = useMemo(() => (cat ? VIDEOS.filter((v) => v.category === cat.id) : []), [cat]);

  const [state, setState] = useState<FilterState>({
    query: "",
    category: id ?? "all",
    tags: [],
    page: 1,
    perPage: 12,
  });
  const tagFromUrl = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tag') : null;
  useEffect(() => {
    if (tagFromUrl) {
      setState((s) => ({ ...s, tags: [tagFromUrl] }));
    }
  }, [tagFromUrl]);
  const [active, setActive] = useState<VideoEntry | null>(null);

  useEffect(() => {
    if (id && id !== state.category) {
      setState((s) => ({ ...s, category: id as VideoCategory, page: 1 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!cat) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-extrabold uppercase">Category not found</h1>
        <p className="mt-2 text-black/70">We couldn&apos;t find that category. Try the full list.</p>
        <div className="mt-4">
          <Link href="/categories">
            <Button variant="default">
              <ArrowLeft className="h-4 w-4" /> Back to categories
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const filtered = useMemo(() => {
    const q = state.query.trim().toLowerCase();
    return all.filter((v) => {
      if (state.tags.length && !state.tags.every((t) => v.tags.includes(t))) return false;
      if (!q) return true;
      return (
        v.description.toLowerCase().includes(q)
        || v.city.toLowerCase().includes(q)
        || v.hashtags.some((h) => h.toLowerCase().includes(q))
      );
    });
  }, [all, state.query, state.tags]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / state.perPage));
  const safePage = Math.min(state.page, totalPages);
  const paged = filtered.slice((safePage - 1) * state.perPage, safePage * state.perPage);

  return (
    <div>
      <section className="border-b-[3px] border-black bg-gray-100 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 font-mono text-[10px] font-bold tracking-widest text-black/60 uppercase hover:text-black"
          >
            <ArrowLeft className="h-3 w-3" /> All categories
          </Link>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1 border-2 border-black bg-orange-500 px-2.5 py-0.5 font-mono text-xs font-bold uppercase">Category</span>
              <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight uppercase md:text-6xl">{cat.label}</h1>
              <p className="mt-1 max-w-2xl text-black/70">{cat.description}</p>
            </div>
            <Link href="/videos">
              <Button variant="default">
                <Grid3x3 className="h-4 w-4" /> View All Videos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <FilterBar state={state} setState={setState} total={filtered.length} />
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {paged.map((v) => (
            <VideoCard key={v.id} video={v} onPlay={setActive} />
          ))}
        </div>
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onChange={(p) => {
            setState({ ...state, page: p });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </section>

      <ReelPlayer
        open={!!active}
        startIndex={active ? paged.findIndex((v) => v.id === active.id) : 0}
        videos={paged.length ? paged : filtered}
        onClose={() => setActive(null)}
      />
    </div>
  );
}
