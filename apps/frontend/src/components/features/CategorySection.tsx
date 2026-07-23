'use client';

import type { JSX } from 'react';

import { ArrowRight, Grid3x3 } from 'lucide-react';
import Link from 'next/link';

import { VideoCard } from '@/components/shared/VideoCard';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Tag, type TagVariant } from '@/components/ui/Tag';
import { useReelPlayer } from '@/hooks/useReelPlayer';
import type { DbCategory } from '@/lib/db';
import type { VideoEntry } from '@/lib/videos';

/**
 * Displays a category heading with up to 6 video cards and a link to the full category page.
 *
 * @param {object} props - Component props.
 * @param {DbCategory} props.cat - Category metadata from the database.
 * @param {VideoEntry[]} props.videos - Videos belonging to this category.
 *
 * @returns {JSX.Element} Rendered section with video cards.
 */
export function CategorySection({ cat, videos }: { cat: DbCategory; videos: VideoEntry[] }): JSX.Element {
  const { play } = useReelPlayer();

  const items = videos.slice(0, 6);

  return (
    <section className="bg-gray-100 py-12 md:py-16" id={`section-${cat.value}`}>
      <Container>
        <div className="mb-6 flex flex-col gap-4 border-b-2 border-zinc-900 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Tag variant={cat.color as TagVariant} text={cat.name} icon={<Grid3x3 className="inline h-3 w-3" />} />
            <h2 className="text-4xl font-bold tracking-tighter uppercase md:text-5xl">{cat.name}</h2>
            <p className="mt-2 text-zinc-700">{cat.description}</p>
          </div>
          <div className="mt-2 flex shrink-0 justify-start md:justify-end">
            <Link href={`/categories/${cat.value}`}>
              <Button variant="default-outline" size="sm">
                <Grid3x3 className="size-4" />
                View all <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {items.map((v) => (
            <VideoCard key={v.id} video={v} onPlay={() => play(v, items)} />
          ))}
          {items.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-black/40 p-8 text-center font-mono text-sm text-black/50 uppercase">
              No videos in this category yet — be the first to submit.
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
