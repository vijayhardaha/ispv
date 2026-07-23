import type { JSX } from 'react';

import { MapPin } from 'lucide-react';
import Link from 'next/link';

import { SectionHeader } from '@/components/shared/SectionHeader';
import { Container } from '@/components/ui/Container';
import type { DbLocation } from '@/lib/db';
import type { VideoEntry } from '@/lib/videos';

/**
 * Location list section showing states and union territories with archival video counts.
 *
 * @param {object} props - Component properties.
 * @param {DbLocation[]} props.locations - Location entries from the database.
 * @param {VideoEntry[]} props.videos - Video entries to compute video counts per location.
 *
 * @returns {JSX.Element} Rendered locations section.
 */
export function LocationsMap({ locations, videos }: { locations: DbLocation[]; videos: VideoEntry[] }): JSX.Element {
  const stateCounts = videos.reduce<Record<string, number>>((acc, v) => {
    const loc = (v.location ?? '').trim().toLowerCase();
    if (!loc) {
      return acc;
    }
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});

  const withCounts = locations
    .map((loc) => ({ slug: loc.slug, name: loc.name, count: stateCounts[loc.slug] ?? 0 }))
    .sort((a, b) => b.count - a.count);

  return (
    <section className="bg-gray-100 py-12 md:py-16">
      <Container>
        <SectionHeader
          tagVariant="blue"
          tagText="Map"
          tagIcon={<MapPin className="inline h-3 w-3" />}
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
          <div className="grid grid-cols-3 gap-4">
            {withCounts.map((loc) => (
              <Link
                key={loc.name}
                href={`/videos?location=${loc.slug}`}
                className="shadow-brutal-sm group flex items-center justify-between border-2 border-black bg-white px-3 py-2 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <span className="font-display text-sm font-bold uppercase">{loc.name}</span>
                <span className="font-mono text-[10px] font-bold tracking-tight text-black/60">{loc.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
