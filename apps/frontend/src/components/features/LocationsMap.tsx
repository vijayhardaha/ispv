import type { JSX } from 'react';

import { MapPin } from 'lucide-react';
import Link from 'next/link';

import { SectionHeader } from '@/components/shared/SectionHeader';
import { Container } from '@/components/ui/Container';
import type { DbLocation } from '@/lib/db';

/**
 * Location list section showing states and union territories with archival video counts.
 *
 * @param {object} props - Component properties.
 * @param {DbLocation[]} props.locations - Location entries from the database.
 * @param {{ slug: string; count: number }[]} props.locationCounts - Pre-computed video counts per location slug.
 *
 * @returns {JSX.Element} Rendered locations section.
 */
export function LocationsMap({
  locations,
  locationCounts,
}: {
  locations: DbLocation[];
  locationCounts: { slug: string; count: number }[];
}): JSX.Element {
  const countsMap = Object.fromEntries(locationCounts.map((lc) => [lc.slug, lc.count]));

  const withCounts = locations
    .map((loc) => ({ slug: loc.slug, name: loc.name, count: countsMap[loc.slug] ?? 0 }))
    .sort((a, b) => b.count - a.count);

  return (
    <section className="bg-gray-100 py-12 md:py-16">
      <Container>
        <SectionHeader
          tagVariant="blue"
          tagText="Map"
          tagIcon={<MapPin className="inline size-3" />}
          heading="Locations on the ground"
          description="Every location listed draws from archival videos — sourced from people on the ground and organised by state and union territory. Click any location to jump to its videos."
          href="/videos"
          buttonText="View all videos"
          buttonIcon={<MapPin className="size-4" />}
        />

        <div>
          <div className="mb-2 font-mono text-[10px] font-bold tracking-widest text-black/60 uppercase">
            By location
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {withCounts.map((loc) => (
              <Link
                key={loc.name}
                href={`/videos?location=${loc.slug}`}
                className="shadow-brutal-sm group flex items-center justify-between gap-4 border-2 border-black bg-white px-3 py-2 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <span className="font-display text-sm font-bold uppercase">{loc.name}</span>
                <span className="font-mono text-sm font-bold tracking-tight text-black/80">{loc.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
