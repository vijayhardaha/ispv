import Link from 'next/link';
import type { JSX } from 'react/jsx-runtime';

import { VIDEOS } from '@/data/videos';

const cityMeta: Record<string, { x: number; y: number; color: string }> = {
  Delhi: { x: 38, y: 22, color: 'bg-orange-500' },
  Chandigarh: { x: 35, y: 18, color: 'bg-orange-500' },
  Mumbai: { x: 27, y: 56, color: 'bg-orange-500' },
  Bengaluru: { x: 41, y: 76, color: 'bg-yellow-400' },
  Kolkata: { x: 65, y: 48, color: 'bg-[#0a0a0c] text-white' },
  Hyderabad: { x: 42, y: 64, color: 'bg-yellow-400' },
  Chennai: { x: 47, y: 80, color: 'bg-blue-600 text-white' },
  Pune: { x: 30, y: 58, color: 'bg-orange-500' },
  Jaipur: { x: 30, y: 30, color: 'bg-orange-500' },
  Lucknow: { x: 50, y: 32, color: 'bg-yellow-400' },
  Ahmedabad: { x: 25, y: 42, color: 'bg-orange-500' },
  Srinagar: { x: 30, y: 6, color: 'bg-blue-600 text-white' },
  Guwahati: { x: 70, y: 32, color: 'bg-yellow-400' },
  Bhopal: { x: 38, y: 46, color: 'bg-yellow-400' },
  Thiruvananthapuram: { x: 40, y: 90, color: 'bg-blue-600 text-white' },
  Bhubaneswar: { x: 60, y: 50, color: 'bg-[#0a0a0c] text-white' },
  Indore: { x: 36, y: 46, color: 'bg-orange-500' },
  Visakhapatnam: { x: 56, y: 60, color: 'bg-orange-500' },
  Patna: { x: 55, y: 34, color: 'bg-yellow-400' },
  Dehradun: { x: 36, y: 20, color: 'bg-blue-600 text-white' },
};

/**
 * Interactive schematic map of India showing cities with video counts.
 *
 * @returns {JSX.Element} Rendered map section with city pins and city list.
 */
export function CitiesMap(): JSX.Element {
  const byCity = VIDEOS.reduce<Record<string, number>>((acc, v) => {
    acc[v.city] = (acc[v.city] || 0) + 1;
    return acc;
  }, {});
  const cities = Object.entries(byCity).sort((a, b) => b[1] - a[1]);
  return (
    <section className="border-b-[3px] border-black bg-gray-100 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-16 flex flex-col items-end justify-between border-b-4 border-zinc-900 pb-6 md:flex-row">
          <div>
            <div className="mb-4 inline-block -rotate-2 bg-blue-600 px-3 py-1 text-xs font-bold tracking-widest text-white uppercase">
              From the map
            </div>
            <h2 className="text-4xl font-bold tracking-tighter uppercase md:text-5xl">
              Cities on the{' '}
              <span className="bg-linear-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">Record</span>
            </h2>
          </div>
          <p className="mt-4 max-w-xs border-l-2 border-red-500 pl-4 text-sm text-zinc-600 md:mt-0">
            Every pin is a city with at least one reel in the archive.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          {/* schematic map */}
          <div className="shadow-brutal relative aspect-5/6 border-[3px] border-black bg-white p-2 md:col-span-3">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-size-[28px_28px] opacity-40" />
            <div className="relative h-full w-full">
              {/* rough India silhouette */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
                <path
                  d="M30 6 L36 4 L42 7 L48 6 L54 9 L60 8 L66 12 L70 18 L74 24 L78 30 L80 36 L82 42 L80 48 L78 54 L74 60 L70 66 L66 72 L60 80 L52 86 L46 92 L42 94 L40 88 L38 80 L36 72 L34 64 L30 58 L26 52 L22 46 L20 38 L22 30 L26 22 L28 14 Z"
                  fill="#FFFBF0"
                  stroke="#0A0A0A"
                  strokeWidth="0.6"
                />
              </svg>
              {cities.map(([city, count]) => {
                const meta = cityMeta[city];
                if (!meta) return null;
                return (
                  <div
                    key={city}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${meta.x}%`, top: `${meta.y}%` }}
                  >
                    <div
                      className={`shadow-brutal-sm flex h-7 min-w-7 items-center justify-center border-2 border-black px-1.5 font-mono text-[10px] font-bold ${meta.color}`}
                    >
                      {count}
                    </div>
                    <div className="mt-0.5 text-center font-mono text-[8px] font-bold uppercase">{city}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-2 md:col-span-2">
            {cities.map(([city, count]) => (
              <li key={city}>
                <Link
                  href={`/videos?q=${encodeURIComponent(city)}`}
                  className="shadow-brutal flex items-center justify-between border-[3px] border-black bg-white px-3 py-2 hover:bg-orange-500"
                >
                  <span className="font-display text-sm font-extrabold uppercase">{city}</span>
                  <span className="font-mono text-xs font-bold">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
