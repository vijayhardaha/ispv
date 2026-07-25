import { Suspense, type JSX } from 'react';

import { VideoCardSkeleton } from '@/components/shared/VideoCardSkeleton';
import { Container } from '@/components/ui/Container';
import { CATEGORIES } from '@/constants/categories';
import type { DbCategory } from '@/constants/categories';
import { SLOGANS_PULL_QUOTES } from '@/constants/slogans';
import type { VideoEntry } from '@/lib/videos';

import { CategorySection } from './CategorySection';
import { PullQuoteSection } from './PullQuoteSection';

/**
 * Skeleton placeholder for an entire category section while video data loads.
 *
 * @returns {JSX.Element} A full-width skeleton section with a grid of 4 card skeletons.
 */
function SectionSkeleton(): JSX.Element {
  return (
    <section className="bg-gray-100 py-12 md:py-16">
      <Container>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}

/**
 * Resolves the shared videos promise and renders the category section with an
 * interspersed pull-quote. Used as the resolved child inside the Suspense boundary.
 *
 * @param {object} props - Component props.
 * @param {DbCategory} props.cat - Category to display.
 * @param {number} props.index - Index in the sections list.
 * @param {number} props.totalSections - Total number of category sections.
 * @param {Promise<Record<string, VideoEntry[]>>} props.videosPromise - Shared promise resolving to all category videos.
 *
 * @returns {Promise<JSX.Element>} The resolved category section with an optional pull-quote.
 */
async function CategorySectionContent({
  cat,
  index,
  totalSections,
  videosPromise,
}: {
  cat: DbCategory;
  index: number;
  totalSections: number;
  videosPromise: Promise<Record<string, VideoEntry[]>>;
}): Promise<JSX.Element> {
  const allVideos = await videosPromise;
  const videos = allVideos[cat.slug] ?? [];

  return (
    <>
      <CategorySection cat={cat} videos={videos} />
      {index < totalSections - 1 && (
        <PullQuoteSection
          quote={SLOGANS_PULL_QUOTES[index % SLOGANS_PULL_QUOTES.length].quote}
          person={SLOGANS_PULL_QUOTES[index % SLOGANS_PULL_QUOTES.length].person}
          index={index}
        />
      )}
    </>
  );
}

/**
 * Streaming loader for a single category section on the homepage.
 * Uses a shared promise to get all category videos from a single batch query,
 * then renders CategorySection + PullQuoteSection once resolved.
 * Shows a 4-card skeleton fallback while the batch query is in flight.
 *
 * @param {object} props - Component props.
 * @param {string} props.slug - Category slug to load videos for.
 * @param {number} props.index - Index in the sections list (used for pull-quote rotation).
 * @param {number} props.totalSections - Total number of category sections (determines pull-quote visibility).
 * @param {Promise<Record<string, VideoEntry[]>>} props.videosPromise - Shared promise resolving to all category videos.
 *
 * @returns {JSX.Element} Suspense-wrapped category section with skeleton fallback.
 */
export function CategorySectionLoader({
  slug,
  index,
  totalSections,
  videosPromise,
}: {
  slug: string;
  index: number;
  totalSections: number;
  videosPromise: Promise<Record<string, VideoEntry[]>>;
}): JSX.Element {
  const cat = CATEGORIES.find((c) => c.slug === slug)!;

  return (
    <Suspense fallback={<SectionSkeleton />}>
      <CategorySectionContent cat={cat} index={index} totalSections={totalSections} videosPromise={videosPromise} />
    </Suspense>
  );
}
