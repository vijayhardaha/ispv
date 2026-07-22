import type { JSX } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

/**
 * Page navigation with prev/next buttons and a windowed page number list.
 *
 * @param {object} props - Component properties.
 * @param {number} props.page - Current page number.
 * @param {number} props.totalPages - Total number of pages.
 * @param {(p: number) => void} props.onChange - Callback when the page changes.
 *
 * @returns {JSX.Element | null} Rendered pagination, or null if only one page.
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
      <Button
        variant="default"
        size="sm"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </Button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="border-2 border-black bg-white px-2 py-1 font-mono text-xs font-bold">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'default' : 'default-outline'}
            size="sm"
            className={cn('cursor-default font-mono text-xs font-bold', p === page && '-translate-y-px')}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </Button>
        )
      )}
      <Button
        variant="default"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </Button>
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
