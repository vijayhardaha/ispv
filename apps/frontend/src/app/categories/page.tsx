'use client';

import { useEffect, useState, type JSX } from 'react';

import { breadcrumbSchema, collectionPageSchema } from '@vijayhardaha/schema-builder';
import { JsonLd } from '@vijayhardaha/schema-builder/react';
import { ArrowRight, Grid3x3 } from 'lucide-react';
import Link from 'next/link';

import { VideoCard } from '@/components/shared/VideoCard';
import { Button } from '@/components/ui/Button';
import { useReelPlayer } from '@/hooks/useReelPlayer';
import { cn } from '@/lib/cn';
import { getCategories, type DbCategory } from '@/lib/db';
import { buildBreadcrumbs, globalSchema } from '@/lib/schema';
import { siteUrl } from '@/lib/seo';
import { getAllVideosFromDb, type VideoEntry } from '@/lib/videos';

const title = 'Categories — Browse by Category';
const description =
  'Browse all categories in the Indian Students Protest Vault archive. Explore protest marches, police conduct, Gen Z movement, acts of kindness, women leading, and more.';
const path = '/categories';
const rootUrl = siteUrl();

const schemaData = [
  ...globalSchema(),
  collectionPageSchema({ rootUrl, path }, { name: title, description }),
  breadcrumbSchema({ rootUrl, items: buildBreadcrumbs(path, 'Categories') }),
];

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
      <JsonLd data={schemaData} />
      <section className="border-b-2 border-black bg-black py-10 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="font-mono text-[10px] tracking-widest text-yellow-500 uppercase">/ Categories</div>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight uppercase md:text-6xl">
            Browse by Category
          </h1>
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
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const list = videos.filter((v) => v.category === c.slug);
            return (
              <Link
                key={c.slug}
                href={`/categories/${c.slug}`}
                className={cn(
                  'group shadow-brutal relative block overflow-hidden border-2 border-black p-5 transition-all',
                  'hover:shadow-brutal-lg hover:-translate-x-0.5 hover:-translate-y-0.5'
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="inline-flex items-center gap-1 border-2 border-black bg-white px-2.5 py-0.5 font-mono text-xs font-bold text-black uppercase">
                    {list.length} videos
                  </span>
                  <ArrowRight className="h-6 w-6 -rotate-12 transition-transform group-hover:rotate-0" />
                </div>
                <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight uppercase md:text-4xl">
                  {c.name}
                </h2>
                <p className="mt-2 max-w-xs text-sm opacity-90">{c.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

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

      {videos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <h3 className="font-display text-xl font-extrabold uppercase">Recently added</h3>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {videos.slice(0, 12).map((v) => (
              <VideoCard key={v.id} video={v} onPlay={(video) => play(video, videos)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
