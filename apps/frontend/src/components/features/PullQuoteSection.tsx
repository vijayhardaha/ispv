import type { JSX } from 'react';

import { CoverWaves } from '@/components/ui/CoverWaves';

/**
 * Alternating colourway configs for pull quote sections.
 * Each entry pairs a wave background hex with matching text and shadow colours.
 *
 * @type {PullQuoteColourway}
 * @property {string} bg - Base hex colour for the wave cover background.
 * @property {string} text - Text colour class for content on top of the waves.
 * @property {string} shadow - Hex colour for the quote card shadow.
 */
interface PullQuoteColourway {
  bg: string;
  text: string;
  shadow: string;
}

/**
 * Cycles through 4 distinct brutalist-friendly colourways.
 */
const QUOTE_COLORWAYS: PullQuoteColourway[] = [
  { bg: '#fdc700', text: 'text-black', shadow: '#18181b' },
  { bg: '#e5e7eb', text: 'text-black', shadow: '#18181b' },
  { bg: '#00a63e', text: 'text-white', shadow: '#18181b' },
  { bg: '#18181b', text: 'text-white', shadow: '#f1f1f1' },
];

/**
 * A single pull quote with person attribution, displayed as a full-width section
 * with an alternating layered-wave cover background and a card-in-card layout.
 *
 * @param {object} props - Component properties.
 * @param {string} props.quote - The quote text.
 * @param {string} props.person - The person credited.
 * @param {number} [props.index] - Index used to cycle background colours.
 *
 * @returns {JSX.Element} Rendered pull quote section.
 */
export function PullQuoteSection({
  quote,
  person,
  index = 0,
}: {
  quote: string;
  person: string;
  index?: number;
}): JSX.Element {
  const colourway = QUOTE_COLORWAYS[index % QUOTE_COLORWAYS.length];

  return (
    <section className={`relative overflow-hidden py-14 md:py-18 ${colourway.text}`}>
      <CoverWaves color={colourway.bg} className="absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-4xl px-4 md:px-6">
        {/* Rotated decorative badge */}
        <div className="mb-4 inline-block origin-bottom-left -rotate-1 border-2 border-black bg-white px-3 py-1 pb-1.5 shadow-[4px_4px_0px_0px_#000]">
          <span className="text-xs leading-none font-bold text-black uppercase">
            {'//'} {person}
          </span>
        </div>

        {/* Quote card with heavy shadow */}
        <div
          className="border-2 border-black bg-white p-6 md:p-10"
          style={{ boxShadow: `8px 8px 0px 0px ${colourway.shadow}` }}
        >
          <div className="flex items-start gap-2">
            <span
              className="text-[80px] leading-[0.8] font-black text-yellow-500 select-none md:text-[120px]"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <blockquote className="font-display text-xl leading-snug font-extrabold tracking-tight text-black uppercase md:text-3xl">
              {quote}
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
