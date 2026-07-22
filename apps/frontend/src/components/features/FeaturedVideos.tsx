'use client';

import type { JSX } from 'react';

import { ArrowRight, Grid3x3, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Tag } from '@/components/ui/Tag';
import type { VideoEntry } from '@/data/videos';
import { useReelPlayer } from '@/hooks/useReelPlayer';

/**
 * Section displaying featured videos from the archive with a call-to-action.
 *
 * @param {object} props - Component properties.
 * @param {VideoEntry[]} props.videos - All video entries to filter featured from.
 *
 * @returns {JSX.Element} Rendered featured videos section.
 */
export function FeaturedVideos({ videos }: { videos: VideoEntry[] }): JSX.Element {
  const { play } = useReelPlayer();
  const featured = videos.filter((v) => v.featured);
  if (featured.length === 0) return <></>;

  return (
    <section className="border-b-2 border-black bg-yellow-400 py-12 md:py-16">
      <Container>
        <div className="mb-6 flex flex-col gap-4 border-b-4 border-zinc-900 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Tag variant="black" text="Featured" icon={<Sparkles className="inline h-3 w-3" />} />
            <h2 className="text-4xl font-bold tracking-tighter uppercase md:text-5xl">
              Watch These{' '}
              <span className="bg-linear-to-r from-red-600 to-red-500 bg-clip-text text-transparent">First</span>
            </h2>
            <p className="mt-2 max-w-sm text-sm text-zinc-700">
              Two real reels submitted by independent reporters — the rest of the archive follows.
            </p>
          </div>
          <div className="mt-2 flex shrink-0 justify-start md:justify-end">
            <Link href="/categories">
              <Button variant="default-outline" size="sm">
                <Grid3x3 className="size-4" />
                View categories <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {featured.map((v) => (
            <FeaturedCard key={v.id} video={v} onPlay={() => play(v, featured)} />
          ))}
        </div>
      </Container>
    </section>
  );
}

/**
 * Featured video card with thumbnail, description, hashtags, and click-to-play overlay.
 *
 * @param {object} props - Component properties.
 * @param {VideoEntry} props.video - Video entry to display.
 * @param {() => void} props.onPlay - Callback when the card is clicked.
 *
 * @returns {JSX.Element} Rendered featured card.
 */
function FeaturedCard({ video, onPlay }: { video: VideoEntry; onPlay: () => void }): JSX.Element {
  return (
    <button
      onClick={onPlay}
      className="group shadow-brutal hover:shadow-brutal-lg relative block w-full overflow-hidden border-2 border-black bg-white text-left transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
    >
      <div className="p-5">
        <div className="font-mono text-[10px] font-bold tracking-widest text-black/60 uppercase">
          {video.city}, {video.state}
        </div>
        <h3 className="font-display mt-2 text-2xl leading-tight font-extrabold uppercase md:text-3xl">
          {video.description.slice(0, 120)}
          {video.description.length > 120 ? '…' : ''}
        </h3>
        <p className="mt-2 text-black/80">{video.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {video.hashtags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 border-2 border-black bg-yellow-400 px-2 py-0.5 font-mono text-[10px] font-bold tracking-tight uppercase"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="shadow-brutal-sm mt-4 inline-flex items-center gap-2 border-2 border-black bg-yellow-400 px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest uppercase">
          <span className="animate-pulse-ring h-2 w-2 rounded-full bg-yellow-400" />
          Click to play · Swipe up/down for more
        </div>
      </div>
    </button>
  );
}
