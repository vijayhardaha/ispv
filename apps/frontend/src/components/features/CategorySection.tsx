'use client';

import type { JSX } from 'react';

import { Grid3x3 } from 'lucide-react';

import { SectionHeader } from '@/components/shared/SectionHeader';
import { VideoCard } from '@/components/shared/VideoCard';
import { Container } from '@/components/ui/Container';
import type { TagVariant } from '@/components/ui/Tag';
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
    <section className="bg-gray-100 py-12 md:py-16" id={`section-${cat.slug}`}>
      <Container>
        <SectionHeader
          tagVariant={cat.color as TagVariant}
          tagText={cat.tag}
          tagIcon={<Grid3x3 className="inline h-3 w-3" />}
          heading={cat.name}
          description={cat.description ?? undefined}
          href={`/categories/${cat.slug}`}
          buttonIcon={<Grid3x3 className="size-4" />}
        />

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
