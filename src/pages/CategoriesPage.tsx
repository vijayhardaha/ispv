import { useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES, VIDEOS, type VideoEntry } from "@/data/videos";
import { ArrowRight, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { VideoCard } from "@/components/videos/VideoCard";
import { ReelPlayer } from "@/components/videos/ReelPlayer";
import { cn } from "@/lib/utils";

const toneMap: Record<string, string> = {
  saffron: "bg-saffron",
  navy: "bg-navy text-paper",
  sun: "bg-sun",
  hotpink: "bg-hotpink text-paper",
  lime: "bg-lime",
  indiaGreen: "bg-indiaGreen text-paper",
};

export function CategoriesPage() {
  const [active, setActive] = useState<VideoEntry | null>(null);
  return (
    <div>
      {/* Hero */}
      <section className="border-b-3 border-ink bg-navy py-10 text-paper">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-saffron">
            / Categories
          </div>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight md:text-6xl">
            Browse by Category
          </h1>
          <p className="mt-2 max-w-2xl text-paper/80">
            Six core categories, all peaceful, all searchable. Click into
            any of them to see the full list, or jump to{" "}
            <Link to="/videos" className="underline decoration-saffron decoration-2 underline-offset-4 hover:text-saffron">
              all videos
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Big category cards */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => {
            const list = VIDEOS.filter((v) => v.category === c.id);
            return (
              <Link
                key={c.id}
                to={`/categories/${c.id}`}
                className={cn(
                  "group relative block overflow-hidden border-3 border-ink p-5 shadow-brutal transition-all",
                  "hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-lg",
                  toneMap[c.color]
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="nb-badge border-ink bg-white text-ink">
                    {list.length} videos
                  </span>
                  <ArrowRight className="h-6 w-6 -rotate-12 transition-transform group-hover:rotate-0" />
                </div>
                <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
                  {c.label}
                </h2>
                <p className="mt-2 max-w-xs text-sm opacity-90">
                  {c.description}
                </p>
                <div className="mt-5 flex -space-x-2">
                  {list.slice(0, 4).map((v) => (
                    <div
                      key={v.id}
                      className="h-12 w-10 overflow-hidden border-2 border-ink"
                    >
                      <img
                        src={v.thumbnail}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* View All CTA */}
      <section className="border-t-3 border-ink bg-sun py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4 px-4 text-center md:px-6">
          <Grid3x3 className="h-10 w-10" />
          <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight">
            Want the full archive?
          </h2>
          <Link to="/videos">
            <Button variant="info" size="lg">
              View All Videos <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <h3 className="font-display text-xl font-extrabold uppercase">
          Recently added
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {VIDEOS.slice(0, 12).map((v) => (
            <VideoCard key={v.id} video={v} onPlay={setActive} size="sm" />
          ))}
        </div>
      </section>

      <ReelPlayer
        open={!!active}
        startIndex={active ? VIDEOS.findIndex((v) => v.id === active.id) : 0}
        videos={VIDEOS}
        onClose={() => setActive(null)}
      />
    </div>
  );
}