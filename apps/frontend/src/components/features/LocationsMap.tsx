import type { JSX } from 'react';

import { ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Tag } from '@/components/ui/Tag';
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
    if (!loc) return acc;
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});

  const withCounts = locations
    .map((loc) => ({ name: loc.name, count: stateCounts[loc.name.toLowerCase()] ?? 0 }))
    .sort((a, b) => b.count - a.count);

  return (
    <section className="bg-gray-100 py-12 md:py-16">
      <Container>
        <div className="mb-6 flex flex-col gap-4 border-b-2 border-zinc-900 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Tag variant="blue" text="Map" icon={<MapPin className="inline h-3 w-3" />} />
            <h2 className="text-4xl font-bold tracking-tighter uppercase md:text-5xl">Locations on the ground</h2>
            <p className="mt-2 max-w-sm text-sm text-zinc-700">
              Every location listed draws from archival videos — sourced from people on the ground and organised by
              state and union territory. Click any location to jump to its videos.
            </p>
          </div>
          <div className="mt-2 flex shrink-0 justify-start md:justify-end">
            <Link href="/videos">
              <Button variant="default-outline" size="sm">
                <MapPin className="size-4" />
                View all videos <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div>
          <div className="mb-2 font-mono text-[10px] font-bold tracking-widest text-black/60 uppercase">
            By location
          </div>
          <div className="grid grid-cols-3 gap-4">
            {withCounts.map((loc) => (
              <Link
                key={loc.name}
                href={`/videos?q=${encodeURIComponent(loc.name)}`}
                className="shadow-brutal-sm group flex items-center justify-between border-2 border-black bg-white px-3 py-2 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
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
