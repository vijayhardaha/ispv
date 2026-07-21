"use client";

import { useEffect, useMemo, useState, Suspense, type JSX } from "react";

import { useSearchParams } from "next/navigation";

import { FilterBar, type FilterState } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";
import { ReelPlayer } from "@/components/videos/ReelPlayer";
import { VideoCard } from "@/components/videos/VideoCard";
import { VIDEOS, type VideoEntry, type VideoCategory } from "@/data/videos";

const DEFAULT_STATE: FilterState = { query: "", category: "all", tags: [], page: 1, perPage: 36 };

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
    query: searchParams?.get("q") ?? "",
    category: (searchParams?.get("category") as VideoCategory) ?? "all",
    tags: searchParams?.get("tag") ? [searchParams.get("tag")!] : [],
  }));
  const [active, setActive] = useState<VideoEntry | null>(null);

  useEffect(() => {
    const next = new URLSearchParams();
    if (state.query) next.set("q", state.query);
    if (state.category !== "all") next.set("category", state.category);
    if (state.tags.length) next.set("tag", state.tags[0]);
    if (state.page !== 1) next.set("page", String(state.page));
    window.history.replaceState(null, "", `?${next.toString()}`);
  }, [state]);

  const filtered = useMemo(() => {
    const q = state.query.trim().toLowerCase();
    return VIDEOS.filter((v) => {
      if (state.category !== "all" && v.category !== state.category) return false;
      if (state.tags.length && !state.tags.every((t) => v.tags.includes(t))) return false;
      if (!q) return true;
      return (
        v.description.toLowerCase().includes(q)
        || v.city.toLowerCase().includes(q)
        || v.state.toLowerCase().includes(q)
        || v.hashtags.some((h) => h.toLowerCase().includes(q))
        || v.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [state]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / state.perPage));
  const safePage = Math.min(state.page, totalPages);
  const paged = filtered.slice((safePage - 1) * state.perPage, safePage * state.perPage);

  return (
    <div className="bg-gray-100">
      <section className="border-b-[3px] border-black bg-[#0a0a0c] py-10 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="font-mono text-[10px] tracking-widest text-orange-600 uppercase">/ All Videos</div>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight uppercase md:text-6xl">The Full Archive</h1>
          <p className="mt-2 max-w-2xl text-white/80">Every reel we have on file. Use the search, tags, and category filters to narrow it down.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <FilterBar state={state} setState={setState} total={filtered.length} />

        <div className="mt-6 flex items-center justify-between">
          <div className="font-mono text-[10px] tracking-widest text-black/60 uppercase">Page {safePage} of {totalPages} · {filtered.length} videos</div>
        </div>

        {paged.length === 0 ? (
          <div className="mt-10 border-[3px] border-dashed border-black/40 p-12 text-center">
            <div className="font-display text-2xl font-extrabold uppercase">Nothing matched</div>
            <p className="mt-1 text-black/60">Try a different search term or fewer tags.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
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
