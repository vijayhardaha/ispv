'use client';

import type { JSX } from 'react';

import { useParams } from 'next/navigation';

import { breadcrumbSchema, webPageSchema } from '@vijayhardaha/schema-builder';
import { JsonLd } from '@vijayhardaha/schema-builder/react';

import type { DbCategory } from '@/lib/db';
import { buildBreadcrumbs, globalSchema } from '@/lib/schema';
import { siteUrl } from '@/lib/seo';
import { useCategoryPage } from '@/app/categories/[id]/useCategoryPage';
import { CategoryHero } from '@/app/categories/[id]/CategoryHero';
import { CategoryVideos } from '@/app/categories/[id]/CategoryVideos';

const rootUrl = siteUrl();
const pathPrefix = '/categories';

/**
 * Individual category page with filtered videos, search, and pagination.
 *
 * @returns {JSX.Element} Rendered category page.
 */
export default function CategoryPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const value = params?.id ?? '';
  const { cat, allLocations, allTags, loading, filters, play } = useCategoryPage(value);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="font-mono text-xs font-bold text-black/50 uppercase">Loading...</div>
      </div>
    );
  }

  if (!cat) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-extrabold uppercase">Category not found</h1>
        <p className="mt-2 text-black/70">We couldn&apos;t find that category. Try the full list.</p>
      </div>
    );
  }

  const catPath = `${pathPrefix}/${value}`;
  const schemaData = buildCategorySchema(rootUrl, catPath, cat);

  return (
    <div>
      <JsonLd data={schemaData} />
      <CategoryHero cat={cat} value={value} />
      <CategoryVideos
        {...filters}
        allTags={allTags}
        allLocations={allLocations}
        onPlay={play}
        onChangePage={(page) => filters.setState((s) => ({ ...s, page }))}
      />
    </div>
  );
}

function buildCategorySchema(rootUrl: string, catPath: string, cat: DbCategory) {
  return [
    ...globalSchema(),
    webPageSchema({ rootUrl, path: catPath, breadcrumb: true }, { name: cat.name, description: cat.description ?? '' }),
    breadcrumbSchema({ rootUrl, items: buildBreadcrumbs(catPath, cat.name) }),
  ];
}
