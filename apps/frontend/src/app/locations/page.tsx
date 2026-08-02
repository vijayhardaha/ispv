import { type JSX } from 'react';

import { breadcrumbSchema, collectionPageSchema } from '@vijayhardaha/schema-builder';
import { JsonLd } from '@vijayhardaha/schema-builder/react';
import { ArrowRight, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { RecentlyAddedVideos } from '@/components/features/RecentlyAddedVideos';
import { PageHero } from '@/components/shared/PageHero';
import { Button } from '@/components/ui/Button';
import type { DbLocation } from '@/constants/locations';
import { getLocationVideoCounts, getLocations } from '@/lib/db';
import { buildMetadata, buildBreadcrumbs, globalSchema, siteUrl } from '@/lib/seo';
import { getPublishedVideos } from '@/lib/videos';

// ── Locations page config ──────────────────────────────────────────────────

/** Site URL used in JSON-LD schemas. */
const ROOT_URL = siteUrl();

/** Page title displayed in SEO metadata. */
const PAGE_TITLE = 'Locations — Browse by Location';
/** Page description used in SEO metadata and Open Graph tags. */
const PAGE_DESCRIPTION =
  'Browse all locations in the Indian Students Protest Vault archive. Explore protest footage from across Indian states, union territories, and abroad.';
/** URL path segment used for canonical links and breadcrumbs. */
const PAGE_PATH = '/locations';

/** JSON-LD schemas for the locations page. */
const PAGE_SCHEMA = [
  ...globalSchema(),
  collectionPageSchema({ rootUrl: ROOT_URL, path: PAGE_PATH }, { name: PAGE_TITLE, description: PAGE_DESCRIPTION }),
  breadcrumbSchema({ rootUrl: ROOT_URL, items: buildBreadcrumbs(PAGE_PATH, 'Locations') }),
];

// ── Page metadata ──────────────────────────────────────────────────────────

/** SEO metadata for the locations page, rendered server-side via next/js. */
export const metadata: Metadata = buildMetadata({ title: PAGE_TITLE, description: PAGE_DESCRIPTION, path: PAGE_PATH });

// ── ISR config ─────────────────────────────────────────────────────────────

/** Revalidate the locations page every 5 minutes for Incremental Static Regeneration. */
export const revalidate = 300;

/**
 * Location card linking to the videos archive filtered by that location.
 *
 * @param {object} props - Component props.
 * @param {DbLocation} props.location - Location data to display.
 * @param {number} props.videoCount - Number of videos in this location.
 *
 * @returns {JSX.Element} Rendered location card.
 */
function LocationCard({ location, videoCount }: { location: DbLocation; videoCount: number }): JSX.Element {
  return (
    <Link
      key={location.slug}
      href={`/videos?location=${location.slug}`}
      className="group shadow-brutal hover:shadow-brutal-lg relative block overflow-hidden border-2 border-black p-5 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">
        <span className="inline-flex items-center gap-1 border-2 border-black bg-white px-2.5 py-0.5 font-mono text-xs font-bold text-black uppercase">
          {videoCount} videos
        </span>
        <ArrowRight className="h-6 w-6 -rotate-12 transition-transform group-hover:rotate-0" />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <MapPin className="h-6 w-6 shrink-0" />
        <h2 className="font-display text-2xl font-extrabold tracking-tight uppercase">{location.name}</h2>
      </div>
    </Link>
  );
}

/**
 * Responsive grid of all location cards with their video counts.
 *
 * @param {object} props - Component props.
 * @param {DbLocation[]} props.locations - All locations to display.
 * @param {Record<string, number>} props.locationCounts - Map of location slug to video count.
 *
 * @returns {JSX.Element} Rendered location grid.
 */
function LocationGrid({
  locations,
  locationCounts,
}: {
  locations: DbLocation[];
  locationCounts: Record<string, number>;
}): JSX.Element {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((l) => (
          <LocationCard key={l.slug} location={l} videoCount={locationCounts[l.slug] ?? 0} />
        ))}
      </div>
    </section>
  );
}

/**
 * Call-to-action banner linking to the full video archive.
 *
 * @returns {JSX.Element} Rendered CTA banner.
 */
function FullArchiveCta(): JSX.Element {
  return (
    <section className="border-t-2 border-black bg-yellow-400 py-10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4 px-4 text-center md:px-6">
        <MapPin className="h-10 w-10" />
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
 * Locations listing page — renders locations with video counts and recently added videos.
 * Fetches data server-side; no client-side loading state needed.
 *
 * @returns {Promise<JSX.Element>} Rendered locations page.
 */
export default async function LocationsPage(): Promise<JSX.Element> {
  const [{ videos }, locations, locationCountsRaw] = await Promise.all([
    getPublishedVideos({ perPage: 12 }),
    getLocations(),
    getLocationVideoCounts(),
  ]);

  const locationCounts = Object.fromEntries(locationCountsRaw.map((lc) => [lc.slug, lc.count]));

  return (
    <div>
      <JsonLd data={PAGE_SCHEMA} />

      <PageHero breadcrumb="Locations" title="Browse by Location">
        <p className="mt-2 max-w-2xl text-white/80">
          Every state, union territory, and region from the archive. Click into any to see its videos, or jump to{' '}
          <Link
            href="/videos"
            className="decoration-saffron underline decoration-2 underline-offset-4 hover:text-yellow-500"
          >
            all videos
          </Link>
          .
        </p>
      </PageHero>

      <LocationGrid locations={locations} locationCounts={locationCounts} />

      <FullArchiveCta />

      <RecentlyAddedVideos videos={videos} />
    </div>
  );
}
