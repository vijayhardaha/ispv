import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { VideoCard } from "@/components/videos/VideoCard";
import { ReelPlayer } from "@/components/videos/ReelPlayer";
import { type VideoEntry, CATEGORIES, type VideoCategory } from "@/data/videos";
import { cn } from "@/lib/utils";

const toneMap: Record<string, string> = {
  saffron: "bg-saffron",
  navy: "bg-navy text-paper",
  sun: "bg-sun",
  hotpink: "bg-hotpink text-paper",
  lime: "bg-lime",
  indiaGreen: "bg-indiaGreen text-paper",
};

export function CategorySection({
  category,
  videos,
  showViewAll = true,
  showAllInGrid = false,
}: {
  category: VideoCategory;
  videos: VideoEntry[];
  showViewAll?: boolean;
  showAllInGrid?: boolean;
}) {
  const [activeVideo, setActiveVideo] = useState<VideoEntry | null>(null);
  const cat = CATEGORIES.find((c) => c.id === category);
  if (!cat) return null;
  const items = showAllInGrid ? videos : videos.slice(0, 6);

  return (
    <section
      className="border-b-3 border-ink bg-paper py-12 md:py-16"
      id={`section-${cat.id}`}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "border-3 border-ink px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest shadow-brutal-sm",
                  toneMap[cat.color]
                )}
              >
                Category
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
                {videos.length} {videos.length === 1 ? "video" : "videos"}
              </span>
            </div>
            <h2 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
              {cat.label}
            </h2>
            <p className="mt-1 max-w-2xl text-ink/70">{cat.description}</p>
          </div>
          {showViewAll && (
            <Link to={`/categories/${cat.id}`}>
              <Button variant={cat.color as any} size="md">
                <Grid3x3 className="h-4 w-4" /> View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {items.map((v) => (
            <VideoCard key={v.id} video={v} onPlay={setActiveVideo} />
          ))}
          {items.length === 0 && (
            <div className="col-span-full border-3 border-dashed border-ink/40 p-8 text-center font-mono text-sm uppercase text-ink/50">
              No videos in this category yet — be the first to submit.
            </div>
          )}
        </div>
      </div>

      <ReelPlayer
        open={!!activeVideo}
        startIndex={activeVideo ? items.findIndex((v) => v.id === activeVideo.id) : 0}
        videos={items}
        onClose={() => setActiveVideo(null)}
      />
    </section>
  );
}