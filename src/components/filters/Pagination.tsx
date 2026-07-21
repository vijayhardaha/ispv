import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { JSX } from 'react/jsx-runtime';

import { cn } from '@/lib/utils';

/**
 * Paginated navigation with prev/next buttons and page number ellipsis.
 *
 * @param {object} props - Component properties.
 * @param {number} props.page - Current active page number.
 * @param {number} props.totalPages - Total number of pages.
 * @param {(p: number) => void} props.onChange - Callback when the page changes.
 *
 * @returns {JSX.Element | null} Rendered pagination nav, or null if only one page.
 */
export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}): JSX.Element | null {
  if (totalPages <= 1) return null;
  const pages = buildPageList(page, totalPages);
  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="shadow-brutal hover:shadow-brutal-lg active:shadow-brutal-press focus-visible:shadow-brutal inline-flex items-center justify-center gap-2 border-2 border-black bg-white px-3 py-2.5 text-sm font-bold tracking-wide uppercase transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:outline-none active:translate-x-0.5 active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" /> Prev
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="border-[3px] border-black bg-white px-3 py-1.5 font-mono text-sm font-bold">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'border-[3px] border-black px-3 py-1.5 font-mono text-sm font-bold transition-all',
              p === page ? 'shadow-brutal-sm -translate-y-px bg-orange-500 text-black' : 'bg-white hover:bg-orange-500'
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="shadow-brutal hover:shadow-brutal-lg active:shadow-brutal-press focus-visible:shadow-brutal inline-flex items-center justify-center gap-2 border-2 border-black bg-white px-3 py-2.5 text-sm font-bold tracking-wide uppercase transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:outline-none active:translate-x-0.5 active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
        aria-label="Next page"
      >
        Next <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function buildPageList(page: number, total: number): (number | '…')[] {
  const out: (number | '…')[] = [];
  const window = 1;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= page - window && i <= page + window)) {
      out.push(i);
    } else if (out[out.length - 1] !== '…') {
      out.push('…');
    }
  }
  return out;
}
