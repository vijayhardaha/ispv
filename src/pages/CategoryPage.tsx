import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CATEGORIES,
  VIDEOS,
  type VideoCategory,
  type VideoEntry,
  type SortKey,
} from "@/data/videos";
import { FilterBar, type FilterState } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";
import { VideoCard } from "@/components/videos/VideoCard";
import { ReelPlayer } from "@/components/videos/ReelPlayer";
import { ArrowLeft, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CategoryPage() {
  const { id } = useParams<{ id: VideoCategory }>();
  const cat = CATEGORIES.find((c) => c.id === id);
  const all = useMemo(
    () => (cat ? VIDEOS.filter((v) => v.category === cat.id) : []),
    [cat]
  );

  const [state, setState] = useState<FilterState>({
    query: "",
    sort: "newest",
    category: (id as VideoCategory) ?? "all",
    tags: [],
    page: 1,
    perPage: 12,
  });
  const [active, setActive] = useState<VideoEntry | null>(null);

  // keep state.category in sync with the URL param
  useEffect(() => {
    if (id && id !== state.category) {
      setState((s) => ({ ...s, category: id as VideoCategory, page: 1 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!cat) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-extrabold uppercase">
          Category not found
        </h1>
        <p className="mt-2 text-ink/70">
          We couldn't find that category. Try the full list.
        </p>
        <div className="mt-4">
          <Link to="/categories">
            <Button variant="primary">
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
      if (state.tags.length && !state.tags.every((t) => v.tags.includes(t)))
        return false;
      if (!q) return true;
      return (
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.hashtags.some((h) => h.toLowerCase().includes(q))
      );
    });
  }, [all, state.query, state.tags]);

  const sorted = useMemo(() => sortVideos(filtered, state.sort), [filtered, state.sort]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / state.perPage));
  const safePage = Math.min(state.page, totalPages);
  const paged = sorted.slice(
    (safePage - 1) * state.perPage,
    safePage * state.perPage
  );

  return (
    <div>
      <section className="border-b-3 border-ink bg-paper py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Link
            to="/categories"
            className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60 hover:text-ink"
          >
            <ArrowLeft className="h-3 w-3" /> All categories
          </Link>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="nb-badge bg-saffron">Category</span>
              <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight md:text-6xl">
                {cat.label}
              </h1>
              <p className="mt-1 max-w-2xl text-ink/70">{cat.description}</p>
            </div>
            <Link to="/videos">
              <Button variant="info">
                <Grid3x3 className="h-4 w-4" /> View All Videos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <FilterBar state={state} setState={setState} total={sorted.length} />
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
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
        videos={paged.length ? paged : sorted}
        onClose={() => setActive(null)}
      />
    </div>
  );
}

function sortVideos(videos: VideoEntry[], sort: SortKey) {
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