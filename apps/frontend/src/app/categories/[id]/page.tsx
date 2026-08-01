'use client';

import type { JSX } from 'react';

import { breadcrumbSchema, webPageSchema } from '@vijayhardaha/schema-builder';
import { JsonLd } from '@vijayhardaha/schema-builder/react';
import { useParams } from 'next/navigation';

import { CategoryHero } from '@/app/categories/[id]/CategoryHero';
import { CategoryVideos } from '@/app/categories/[id]/CategoryVideos';
import { useCategoryPage } from '@/app/categories/[id]/useCategoryPage';
import type { DbCategory } from '@/lib/db';
import { buildBreadcrumbs, globalSchema, siteUrl } from '@/lib/seo';

const ROOT_URL = siteUrl();
const PATH_PREFIX = '/categories';

/**
 * Builds the JSON-LD schema data for a category page.
 *
 * @param {string} rootUrl - Base URL of the site.
 * @param {string} catPath - URL path for this category (e.g. /categories/delhi).
 * @param {DbCategory} cat - Category record to build schema for.
 *
 * @returns {Array<object>} Array of JSON-LD schema objects.
 */
function buildCategorySchema(rootUrl: string, catPath: string, cat: DbCategory): Array<object> {
  return [
    ...globalSchema(),
    webPageSchema({ rootUrl, path: catPath, breadcrumb: true }, { name: cat.name, description: cat.description ?? '' }),
    breadcrumbSchema({ rootUrl, items: buildBreadcrumbs(catPath, cat.name) }),
  ];
}

/**
 * Skeleton placeholder for the category hero while category data is fetched.
 *
 * @returns {JSX.Element} Animated hero skeleton.
 */
function CategoryHeroSkeleton(): JSX.Element {
  return (
    <section className="border-b-2 border-black bg-gray-100 py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="h-3 w-24 animate-pulse bg-zinc-300" />
        <div className="mt-3 h-4 w-32 animate-pulse border-2 border-zinc-900 bg-zinc-300" />
        <div className="mt-4 h-10 w-2/3 max-w-xl animate-pulse bg-zinc-300 md:h-16" />
        <div className="mt-3 h-3 w-3/4 max-w-md animate-pulse bg-zinc-300" />
      </div>
    </section>
  );
}

/**
 * Individual category page with filtered videos, search, and pagination.
 *
 * @returns {JSX.Element} Rendered category page.
 */
export default function CategoryPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const value = params?.id ?? '';
  const { cat, allLocations, allTags, loading, filters, play } = useCategoryPage(value);

  if (!cat && !loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-extrabold uppercase">Category not found</h1>
        <p className="mt-2 text-black/70">We couldn&apos;t find that category. Try the full list.</p>
      </div>
    );
  }

  const catPath = `${PATH_PREFIX}/${value}`;
  const schemaData = cat ? buildCategorySchema(ROOT_URL, catPath, cat) : null;

  return (
    <div>
      {schemaData ? <JsonLd data={schemaData} /> : null}
      {cat ? <CategoryHero cat={cat} value={value} /> : <CategoryHeroSkeleton />}
      <CategoryVideos {...filters} allTags={allTags} allLocations={allLocations} onPlay={play} loading={loading} />
    </div>
  );
}
