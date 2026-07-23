import type { JSX } from 'react';

/**
 * Alternating background styles for pull quote sections.
 * Cycles through 4 distinct brutalist-friendly colourways.
 */
const QUOTE_BG_CYCLE = ['bg-yellow-400', 'bg-gray-200', 'bg-green-700', 'bg-zinc-900'] as const;

/**
 * Maps background index to text colour for child elements.
 */
const TEXT_COLORS: Record<string, string> = {
  'bg-yellow-400': 'text-black',
  'bg-gray-200': 'text-black',
  'bg-green-700': 'text-white',
  'bg-zinc-900': 'text-white',
};

/**
 * Maps background index to the card shadow colour.
 * Uses a lighter shadow on dark backgrounds so it remains visible.
 */
const SHADOW_COLORS: Record<string, string> = {
  'bg-yellow-400': '#18181b',
  'bg-gray-200': '#18181b',
  'bg-green-700': '#18181b',
  'bg-zinc-900': '#52525b',
};

/**
 * A single pull quote with person attribution, displayed as a full-width section
 * with alternating background colour and a card-in-card brutalist layout.
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
  const bg = QUOTE_BG_CYCLE[index % QUOTE_BG_CYCLE.length];
  const textColor = TEXT_COLORS[bg];
  const shadowColor = SHADOW_COLORS[bg];

  return (
    <section className={`relative overflow-hidden py-14 md:py-18 ${bg} ${textColor}`}>
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        {/* Rotated decorative badge */}
        <div className="mb-4 inline-block origin-bottom-left -rotate-1 border-2 border-black bg-white px-3 py-1 pb-1.5 shadow-[4px_4px_0px_0px_#000]">
          <span className="text-xs leading-none font-bold text-black uppercase">{person}</span>
        </div>

        {/* Quote card with heavy shadow */}
        <div
          className="border-2 border-black bg-white p-6 md:p-10"
          style={{ boxShadow: `8px 8px 0px 0px ${shadowColor}` }}
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
