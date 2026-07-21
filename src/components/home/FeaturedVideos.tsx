import { useState } from "react";
import { Link } from "react-router-dom";
import { ReelPlayer } from "@/components/videos/ReelPlayer";
import { Button } from "@/components/ui/Button";
import { Sparkles, ArrowRight } from "lucide-react";
import type { VideoEntry } from "@/data/videos";

export function FeaturedVideos({ videos }: { videos: VideoEntry[] }) {
  const [active, setActive] = useState<VideoEntry | null>(null);
  const featured = videos.filter((v) => v.featured);
  if (featured.length === 0) return null;
  return (
    <section className="border-b-3 border-ink bg-sun py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="nb-badge bg-ink text-paper">
              <Sparkles className="h-3 w-3" /> Featured
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight md:text-5xl">
              Watch These First
            </h2>
            <p className="mt-2 max-w-2xl text-ink/80">
              Two real reels submitted by independent reporters — the rest of
              the archive follows.
            </p>
          </div>
          <Link to="/videos">
            <Button variant="info">
              See all videos <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {featured.map((v) => (
            <FeaturedCard key={v.id} video={v} onPlay={setActive} />
          ))}
        </div>
      </div>
      <ReelPlayer
        open={!!active}
        startIndex={active ? featured.findIndex((v) => v.id === active.id) : 0}
        videos={featured}
        onClose={() => setActive(null)}
      />
    </section>
  );
}

function FeaturedCard({
  video,
  onPlay,
}: {
  video: VideoEntry;
  onPlay: (v: VideoEntry) => void;
}) {
  return (
    <button
      onClick={() => onPlay(video)}
      className="group relative block w-full overflow-hidden border-3 border-ink bg-white text-left shadow-brutal transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-5">
        <div className="relative aspect-[9/14] md:col-span-2 md:aspect-auto md:h-full">
          <img
            src={video.thumbnail}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
          <div className="absolute left-3 top-3">
            <span className="nb-badge bg-saffron text-ink">★ Featured</span>
          </div>
        </div>
        <div className="p-5 md:col-span-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
            {video.city}, {video.state} · {new Date(video.submittedAt).toLocaleDateString()}
          </div>
          <h3 className="mt-2 font-display text-2xl font-extrabold uppercase leading-tight md:text-3xl">
            {video.title}
          </h3>
          <p className="mt-2 text-ink/80">{video.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {video.hashtags.map((t) => (
              <span key={t} className="nb-chip bg-saffron border-ink">
                {t}
              </span>
            ))}
          </div>
          <div className="mt-4 inline-flex items-center gap-2 border-3 border-ink bg-saffron px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest shadow-brutal-sm">
            <span className="h-2 w-2 rounded-full bg-hotpink animate-pulseRing" />
            Click to play · Swipe up/down for more
          </div>
        </div>
      </div>
    </button>
  );
}