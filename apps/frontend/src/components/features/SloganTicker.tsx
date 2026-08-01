import type { JSX } from 'react';

import { SLOGANS } from '@/constants/slogans';
import { cn } from '@/lib/utils';

/**
 * Rotational colour and shadow variants applied to each slogan placard in the marquee.
 */
const PLACARD_STYLES = [
  'border-red-500 shadow-brutal-red-600 rotate-placard-1',
  'border-yellow-400 shadow-brutal-yellow-500 rotate-placard-2',
  'border-blue-600 shadow-brutal-blue-700 rotate-placard-3',
  'border-green-400 shadow-brutal-green-500 rotate-placard-1',
];

/**
 * Animated marquee displaying protest slogans on styled placards.
 *
 * @returns {JSX.Element} Rendered slogan ticker section.
 */
export function SloganTicker(): JSX.Element {
  const items = [...SLOGANS, ...SLOGANS];
  return (
    <div className="mx-0 my-0 overflow-hidden bg-black py-8">
      <div className="animate-marquee flex w-max gap-4">
        {items.map((s, i) => (
          <div
            key={i}
            className={cn(
              'font-body shrink-0 border-2 border-solid bg-white px-4 py-2.5 text-lg font-bold whitespace-nowrap',
              PLACARD_STYLES[i % PLACARD_STYLES.length]
            )}
          >
            {'///'} {s}
          </div>
        ))}
      </div>
    </div>
  );
}
