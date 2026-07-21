'use client';

import { useState, type JSX } from 'react';

import { Sparkles } from 'lucide-react';

import { ReelPlayer } from '@/components/videos/ReelPlayer';
import type { VideoEntry } from '@/data/videos';
import { timeAgo } from '@/lib/utils';

/**
 * Section displaying featured videos with a snap-scroll reel player.
 *
 * @param {object} props - Component properties.
 * @param {VideoEntry[]} props.videos - All available videos to filter for featured.
 *
 * @returns {JSX.Element} Rendered featured section with video cards.
 */
export function FeaturedVideos({ videos }: { videos: VideoEntry[] }): JSX.Element {
  const [active, setActive] = useState<VideoEntry | null>(null);
  const featured = videos.filter((v) => v.featured);
  if (featured.length === 0) return <></>;

  return (
    <section className="border-b-[3px] border-black bg-yellow-400 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-16 flex flex-col items-end justify-between border-b-4 border-zinc-900 pb-6 md:flex-row">
          <div>
            <div className="mb-4 inline-block -rotate-2 bg-blue-600 px-3 py-1 text-xs font-bold tracking-widest text-white uppercase">
              <Sparkles className="mr-1 inline h-3 w-3" /> Featured
            </div>
            <h2 className="text-4xl font-bold tracking-tighter uppercase md:text-5xl">
              Watch These{' '}
              <span className="bg-linear-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">First</span>
            </h2>
          </div>
          <p className="mt-4 max-w-xs border-l-2 border-red-500 pl-4 text-sm text-zinc-600 md:mt-0">
            Two real reels submitted by independent reporters — the rest of the archive follows.
          </p>
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

function FeaturedCard({ video, onPlay }: { video: VideoEntry; onPlay: (v: VideoEntry) => void }) {
  return (
    <button
      onClick={() => onPlay(video)}
      className="group shadow-brutal hover:shadow-brutal-lg relative block w-full overflow-hidden border-[3px] border-black bg-white text-left transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
    >
      <div className="grid grid-cols-1 md:grid-cols-5">
        <div className="relative aspect-9/16 md:col-span-2 md:aspect-auto md:h-full">
          <img
            src={video.thumbnail}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="from-ink/70 absolute inset-0 bg-linear-to-t via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 border-2 border-black bg-orange-500 px-2.5 py-0.5 font-mono text-xs font-bold text-black uppercase">
              ★ Featured
            </span>
          </div>
        </div>
        <div className="p-5 md:col-span-3">
          <div className="font-mono text-[10px] font-bold tracking-widest text-black/60 uppercase">
            {video.city}, {video.state} · {timeAgo(video.submittedAt)}
          </div>
          <h3 className="font-display mt-2 text-2xl leading-tight font-extrabold uppercase md:text-3xl">
            {video.title}
          </h3>
          <p className="mt-2 text-black/80">{video.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {video.hashtags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 border-2 border-black bg-orange-500 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="shadow-brutal-sm mt-4 inline-flex items-center gap-2 border-[3px] border-black bg-orange-500 px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest uppercase">
            <span className="animate-pulse-ring h-2 w-2 rounded-full bg-orange-500" />
            Click to play · Swipe up/down for more
          </div>
        </div>
      </div>
    </button>
  );
}
