'use client';

import { useState, type JSX } from 'react';

import { ArrowRight, Grid3x3 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { ReelPlayer } from '@/components/videos/ReelPlayer';
import { VideoCard } from '@/components/videos/VideoCard';
import { CATEGORIES, VIDEOS, type VideoEntry } from '@/data/videos';
import { cn } from '@/lib/utils';

const toneMap: Record<string, string> = {
  saffron: 'bg-orange-500',
  navy: 'bg-[#0a0a0c] text-white',
  sun: 'bg-yellow-400',
  hotpink: 'bg-orange-500 text-white',
  lime: 'bg-yellow-400',
  indiaGreen: 'bg-blue-600 text-white',
};

/**
 * Categories page with category cards, recently added videos, and reel player.
 *
 * @returns {JSX.Element} Rendered categories overview page.
 */
export default function CategoriesPage(): JSX.Element {
  const [active, setActive] = useState<VideoEntry | null>(null);
  return (
    <div>
      {/* Hero */}
      <section className="border-b-[3px] border-black bg-[#0a0a0c] py-10 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="font-mono text-[10px] tracking-widest text-orange-600 uppercase">/ Categories</div>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight uppercase md:text-6xl">
            Browse by Category
          </h1>
          <p className="mt-2 max-w-2xl text-white/80">
            Six core categories, all peaceful, all searchable. Click into any of them to see the full list, or jump to{' '}
            <Link
              href="/videos"
              className="decoration-saffron underline decoration-2 underline-offset-4 hover:text-orange-600"
            >
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
                href={`/categories/${c.id}`}
                className={cn(
                  'group shadow-brutal relative block overflow-hidden border-[3px] border-black p-5 transition-all',
                  'hover:shadow-brutal-lg hover:-translate-x-0.5 hover:-translate-y-0.5',
                  toneMap[c.color]
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="inline-flex items-center gap-1 border-2 border-black bg-white px-2.5 py-0.5 font-mono text-xs font-bold text-black uppercase">
                    {list.length} videos
                  </span>
                  <ArrowRight className="h-6 w-6 -rotate-12 transition-transform group-hover:rotate-0" />
                </div>
                <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight uppercase md:text-4xl">
                  {c.label}
                </h2>
                <p className="mt-2 max-w-xs text-sm opacity-90">{c.description}</p>
                <div className="mt-5 flex -space-x-2">
                  {list.slice(0, 4).map((v) => (
                    <div key={v.id} className="h-12 w-10 overflow-hidden border-2 border-black">
                      <img src={v.thumbnail} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* View All CTA */}
      <section className="border-t-[3px] border-black bg-yellow-400 py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4 px-4 text-center md:px-6">
          <Grid3x3 className="h-10 w-10" />
          <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase">Want the full archive?</h2>
          <Link href="/videos">
            <Button variant="primary" size="lg">
              View All Videos <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <h3 className="font-display text-xl font-extrabold uppercase">Recently added</h3>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
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
