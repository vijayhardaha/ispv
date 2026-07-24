import { Suspense, type JSX } from 'react';

import { breadcrumbSchema, collectionPageSchema } from '@vijayhardaha/schema-builder';
import { JsonLd } from '@vijayhardaha/schema-builder/react';

import { buildBreadcrumbs, globalSchema } from '@/lib/schema';
import { siteUrl } from '@/lib/seo';

import { VideosPageContent } from './VideosPageContent';

const PAGE_TITLE = 'All Videos — Full Archive';
const PAGE_DESCRIPTION =
  'Browse every reel in the Indian Students Protest Vault archive. Search by city, category, or hashtag and filter to find specific protest recordings.';
const PAGE_PATH = '/videos';
const ROOT_URL = siteUrl();

const SCHEMA_DATA = [
  ...globalSchema(),
  collectionPageSchema({ rootUrl: ROOT_URL, path: PAGE_PATH }, { name: PAGE_TITLE, description: PAGE_DESCRIPTION }),
  breadcrumbSchema({ rootUrl: ROOT_URL, items: buildBreadcrumbs(PAGE_PATH, 'All Videos') }),
];

/**
 * Full video archive page — server component that renders JSON-LD schema and a Suspense-bound client content.
 *
 * @returns {JSX.Element} Rendered videos page.
 */
export default function VideosPage(): JSX.Element {
  const fallback = <div className="min-h-screen bg-gray-100" />;

  return (
    <>
      <JsonLd data={SCHEMA_DATA} />
      <Suspense fallback={fallback}>
        <VideosPageContent />
      </Suspense>
    </>
  );
}
