import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FilterBar, type FilterState } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";
import { VideoCard } from "@/components/videos/VideoCard";
import { ReelPlayer } from "@/components/videos/ReelPlayer";
import { VIDEOS, type VideoEntry, type SortKey, type VideoCategory } from "@/data/videos";
import { Grid, List } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_STATE: FilterState = {
  query: "",
  sort: "newest",
  category: "all",
  tags: [],
  page: 1,
  perPage: 12,
};

export function VideosPage() {
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState<FilterState>(() => ({
    ...DEFAULT_STATE,
    query: params.get("q") ?? "",
    category: (params.get("category") as VideoCategory) ?? "all",
  }));
  const [active, setActive] = useState<VideoEntry | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");

  // sync to URL for shareable filtered views
  useEffect(() => {
    const next = new URLSearchParams();
    if (state.query) next.set("q", state.query);
    if (state.category !== "all") next.set("category", state.category);
    if (state.sort !== "newest") next.set("sort", state.sort);
    if (state.page !== 1) next.set("page", String(state.page));
    setParams(next, { replace: true });
  }, [state, setParams]);

  const filtered = useMemo(() => {
    const q = state.query.trim().toLowerCase();
    return VIDEOS.filter((v) => {
      if (state.category !== "all" && v.category !== state.category) return false;
      if (state.tags.length && !state.tags.every((t) => v.tags.includes(t)))
        return false;
      if (!q) return true;
      return (
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.state.toLowerCase().includes(q) ||
        v.hashtags.some((h) => h.toLowerCase().includes(q)) ||
        v.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [state]);

  const sorted = useMemo(() => sortVideos(filtered, state.sort), [filtered, state.sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / state.perPage));
  const safePage = Math.min(state.page, totalPages);
  const paged = sorted.slice(
    (safePage - 1) * state.perPage,
    safePage * state.perPage
  );

  return (
    <div className="bg-paper">
      {/* Hero band */}
      <section className="border-b-3 border-ink bg-navy py-10 text-paper">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-saffron">
            / All Videos
          </div>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight md:text-6xl">
            The Full Archive
          </h1>
          <p className="mt-2 max-w-2xl text-paper/80">
            Every reel we have on file. Use the search, sort, and tags to
            narrow it down. Click any card to open the snap-scroll player.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <FilterBar state={state} setState={setState} total={sorted.length} />

        <div className="mt-6 flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
            Page {safePage} of {totalPages} · {sorted.length} videos
          </div>
          <div className="hidden border-3 border-ink md:flex">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "border-r-3 border-ink px-2.5 py-1.5",
                view === "grid" ? "bg-saffron" : "bg-white"
              )}
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "px-2.5 py-1.5",
                view === "list" ? "bg-saffron" : "bg-white"
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {paged.length === 0 ? (
          <div className="mt-10 border-3 border-dashed border-ink/40 p-12 text-center">
            <div className="font-display text-2xl font-extrabold uppercase">
              Nothing matched
            </div>
            <p className="mt-1 text-ink/60">
              Try a different search term, fewer tags, or a different sort.
            </p>
          </div>
        ) : view === "grid" ? (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {paged.map((v) => (
              <VideoCard key={v.id} video={v} onPlay={setActive} />
            ))}
          </div>
        ) : (
          <div className="mt-6 divide-y-3 divide-ink border-3 border-ink bg-white">
            {paged.map((v) => (
              <ListRow key={v.id} video={v} onPlay={setActive} />
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
        videos={paged.length ? paged : sorted}
        onClose={() => setActive(null)}
      />
    </div>
  );
}

function ListRow({
  video,
  onPlay,
}: {
  video: VideoEntry;
  onPlay: (v: VideoEntry) => void;
}) {
  return (
    <button
      onClick={() => onPlay(video)}
      className="grid w-full grid-cols-12 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-saffron/30"
    >
      <div className="col-span-3 sm:col-span-2">
        <div className="aspect-[9/14] w-full overflow-hidden border-2 border-ink">
          <img
            src={video.thumbnail}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <div className="col-span-9 sm:col-span-7">
        <h3 className="font-display text-base font-extrabold uppercase">
          {video.title}
        </h3>
        <p className="line-clamp-1 text-sm text-ink/70">{video.description}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {video.hashtags.slice(0, 3).map((t) => (
            <span key={t} className="nb-chip bg-saffron">
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="col-span-12 font-mono text-[10px] uppercase tracking-widest text-ink/60 sm:col-span-3 sm:text-right">
        {video.city}, {video.state} · {video.category}
      </div>
    </button>
  );
}

function sortVideos(videos: VideoEntry[], sort: SortKey): VideoEntry[] {
  const arr = [...videos];
  switch (sort) {
    case "newest":
      return arr.sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
    case "oldest":
      return arr.sort(
        (a, b) =>
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      );
    case "most-viewed":
      return arr.sort((a, b) => b.views - a.views);
    case "most-liked":
      return arr.sort((a, b) => b.likes - a.likes);
    case "title-az":
      return arr.sort((a, b) => a.title.localeCompare(b.title));
    case "title-za":
      return arr.sort((a, b) => b.title.localeCompare(a.title));
  }
}