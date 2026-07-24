'use client';

import { useEffect, useState, type JSX } from 'react';

import { breadcrumbSchema, collectionPageSchema } from '@vijayhardaha/schema-builder';
import { JsonLd } from '@vijayhardaha/schema-builder/react';
import { ArrowRight, Grid3x3 } from 'lucide-react';
import Link from 'next/link';

import { PageHero } from '@/components/shared/PageHero';
import { VideoCard } from '@/components/shared/VideoCard';
import { Button } from '@/components/ui/Button';
import { useReelPlayer } from '@/hooks/useReelPlayer';
import { cn } from '@/lib/cn';
import { getCategories, type DbCategory } from '@/lib/db';
import { buildBreadcrumbs, globalSchema } from '@/lib/schema';
import { siteUrl } from '@/lib/seo';
import { getAllVideosFromDb, type VideoEntry } from '@/lib/videos';

const PAGE_TITLE = 'Categories — Browse by Category';
const PAGE_DESCRIPTION =
  'Browse all categories in the Indian Students Protest Vault archive. Explore protest marches, police conduct, Gen Z movement, acts of kindness, women leading, and more.';
const PAGE_PATH = '/categories';
const ROOT_URL = siteUrl();

const SCHEMA_DATA = [
  ...globalSchema(),
  collectionPageSchema({ rootUrl: ROOT_URL, path: PAGE_PATH }, { name: PAGE_TITLE, description: PAGE_DESCRIPTION }),
  breadcrumbSchema({ rootUrl: ROOT_URL, items: buildBreadcrumbs(PAGE_PATH, 'Categories') }),
];

/**
 * Individual category card with video count, name, and description.
 *
 * @param {object} props - Component properties.
 * @param {DbCategory} props.category - Category record to display.
 * @param {number} props.videoCount - Number of videos in this category.
 *
 * @returns {JSX.Element} Rendered category card link.
 */
function CategoryCard({ category, videoCount }: { category: DbCategory; videoCount: number }): JSX.Element {
  return (
    <Link
      key={category.slug}
      href={`/categories/${category.slug}`}
      className={cn(
        'group shadow-brutal relative block overflow-hidden border-2 border-black p-5 transition-all',
        'hover:shadow-brutal-lg hover:-translate-x-0.5 hover:-translate-y-0.5'
      )}
    >
      <div className="flex items-start justify-between">
        <span className="inline-flex items-center gap-1 border-2 border-black bg-white px-2.5 py-0.5 font-mono text-xs font-bold text-black uppercase">
          {videoCount} videos
        </span>
        <ArrowRight className="h-6 w-6 -rotate-12 transition-transform group-hover:rotate-0" />
      </div>
      <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight uppercase md:text-4xl">
        {category.name}
      </h2>
      <p className="mt-2 max-w-xs text-sm opacity-90">{category.description}</p>
    </Link>
  );
}

/**
 * Grid of all category cards.
 *
 * @param {object} props - Component properties.
 * @param {DbCategory[]} props.categories - Array of category records.
 * @param {VideoEntry[]} props.videos - All videos for counting per category.
 *
 * @returns {JSX.Element} Rendered category grid section.
 */
function CategoryGrid({ categories, videos }: { categories: DbCategory[]; videos: VideoEntry[] }): JSX.Element {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <CategoryCard key={c.slug} category={c} videoCount={videos.filter((v) => v.category === c.slug).length} />
        ))}
      </div>
    </section>
  );
}

/**
 * CTA banner encouraging users to browse the full video archive.
 *
 * @returns {JSX.Element} Rendered CTA section.
 */
function FullArchiveCta(): JSX.Element {
  return (
    <section className="border-t-2 border-black bg-yellow-400 py-10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4 px-4 text-center md:px-6">
        <Grid3x3 className="h-10 w-10" />
        <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase">Want the full archive?</h2>
        <Link href="/videos">
          <Button variant="default" size="lg">
            View All Videos <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

/**
 * Recently added videos section — shows the latest 12 videos.
 *
 * @param {object} props - Component properties.
 * @param {VideoEntry[]} props.videos - All videos sorted by recency.
 * @param {(video: VideoEntry, list: VideoEntry[]) => void} props.onPlay - Callback to open the reel player.
 *
 * @returns {JSX.Element} Rendered recently added section, or empty fragment if no videos.
 */
function RecentlyAdded({
  videos,
  onPlay,
}: {
  videos: VideoEntry[];
  onPlay: (video: VideoEntry, list: VideoEntry[]) => void;
}): JSX.Element {
  if (videos.length === 0) {
    return <></>;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <h3 className="font-display text-xl font-extrabold uppercase">Recently added</h3>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {videos.slice(0, 12).map((v) => (
          <VideoCard key={v.id} video={v} onPlay={(video) => onPlay(video, videos)} />
        ))}
      </div>
    </section>
  );
}

/**
 * Categories listing page — shows all categories with video counts and recently added videos.
 *
 * @returns {JSX.Element} Rendered categories page.
 */
export default function CategoriesPage(): JSX.Element {
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { play } = useReelPlayer();

  useEffect(() => {
    Promise.all([getAllVideosFromDb(), getCategories()]).then(([v, c]) => {
      setVideos(v);
      setCategories(c);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-sm font-bold text-black/50 uppercase">Loading categories...</div>
      </div>
    );
  }

  return (
    <div>
      <JsonLd data={SCHEMA_DATA} />

      <PageHero breadcrumb="Categories" title="Browse by Category">
        <p className="mt-2 max-w-2xl text-white/80">
          All categories from the archive. Click into any to see the full list, or jump to{' '}
          <Link
            href="/videos"
            className="decoration-saffron underline decoration-2 underline-offset-4 hover:text-yellow-500"
          >
            all videos
          </Link>
          .
        </p>
      </PageHero>

      <CategoryGrid categories={categories} videos={videos} />

      <FullArchiveCta />

      <RecentlyAdded videos={videos} onPlay={play} />
    </div>
  );
}
