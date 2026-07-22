'use client';

import type { JSX } from 'react';

import { ArrowRight, Grid3x3 } from 'lucide-react';
import Link from 'next/link';

import { VideoCard } from '@/components/shared/VideoCard';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Tag, type TagVariant } from '@/components/ui/Tag';
import { CATEGORIES, type VideoCategory } from '@/constants/categories';
import { type VideoEntry } from '@/data/videos';
import { useReelPlayer } from '@/hooks/useReelPlayer';

/**
 * Section displaying a grid of videos for a single category with a link to the full list.
 *
 * @param {object} props - Component properties.
 * @param {VideoCategory} props.category - Category identifier to display.
 * @param {VideoEntry[]} props.videos - Video entries filtered to this category.
 *
 * @returns {JSX.Element} Rendered category section.
 */
export function CategorySection({ category, videos }: { category: VideoCategory; videos: VideoEntry[] }): JSX.Element {
  const { play } = useReelPlayer();
  const cat = CATEGORIES.find((c) => c.id === category);
  if (!cat) return <></>;

  const items = videos.slice(0, 6);

  return (
    <section className="bg-gray-100 py-12 md:py-16" id={`section-${cat.id}`}>
      <Container>
        <div className="mb-6 flex flex-col gap-4 border-b-2 border-zinc-900 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Tag variant={cat.color as TagVariant} text={cat.label} icon={<Grid3x3 className="inline h-3 w-3" />} />
            <h2 className="text-4xl font-bold tracking-tighter uppercase md:text-5xl">{cat.label}</h2>
            <p className="mt-2 max-w-sm text-sm text-zinc-700">{cat.description}</p>
          </div>
          <div className="mt-2 flex shrink-0 justify-start md:justify-end">
            <Link href={`/categories/${cat.id}`}>
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
