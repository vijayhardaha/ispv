import type { JSX } from 'react';

import { ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Tag } from '@/components/ui/Tag';
import { VIDEOS } from '@/data/videos';

/**
 * Interactive map of India with clickable city markers and a sidebar city list.
 *
 * @returns {JSX.Element} Rendered cities map section.
 */
export function CitiesMap(): JSX.Element {
  const cityCounts = VIDEOS.reduce<Record<string, number>>((acc, v) => {
    acc[v.city] = (acc[v.city] || 0) + 1;
    return acc;
  }, {});
  const sorted = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);

  return (
    <section className="bg-gray-100 py-12 md:py-16">
      <Container>
        <div className="mb-6 flex flex-col gap-4 border-b-2 border-zinc-900 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Tag variant="blue" text="Map" icon={<MapPin className="inline h-3 w-3" />} />
            <h2 className="text-4xl font-bold tracking-tighter uppercase md:text-5xl">Cities on the ground</h2>
            <p className="mt-2 max-w-sm text-sm text-zinc-700">Click any city to jump straight to its videos.</p>
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
          <div className="mb-2 font-mono text-[10px] font-bold tracking-widest text-black/60 uppercase">By city</div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {sorted.map(([city, count]) => (
              <Link
                key={city}
                href={`/videos?q=${encodeURIComponent(city)}`}
                className="shadow-brutal-sm group flex items-center justify-between border-2 border-black bg-white px-3 py-2 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <span className="font-display text-sm font-bold uppercase">{city}</span>
                <span className="font-mono text-[10px] font-bold tracking-wider text-black/60">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
