'use client';

import type { JSX } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Builds a URL search params string with the given page number, preserving other params.
 *
 * @param {URLSearchParams | null} current - Current search params.
 * @param {number} page - Target page number.
 *
 * @returns {string} Query string with the page param updated.
 */
function buildPageHref(current: URLSearchParams | null, page: number): string {
  const params = new URLSearchParams(current?.toString() ?? '');
  if (page <= 1) {
    params.delete('page');
  } else {
    params.set('page', String(page));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '?';
}

/**
 * Page navigation with prev/next buttons and a windowed page number list.
 * Page numbers are Links that update the URL with ?page=N.
 *
 * @param {object} props - Component properties.
 * @param {number} props.page - Current page number.
 * @param {number} props.totalPages - Total number of pages.
 *
 * @returns {JSX.Element | null} Rendered pagination, or null if only one page.
 */
export function Pagination({ page, totalPages }: { page: number; totalPages: number }): JSX.Element | null {
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPageList(page, totalPages);

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 && (
        <Link href={buildPageHref(searchParams, page - 1)} aria-label="Previous page">
          <Button variant="default" size="sm">
            <ChevronLeft className="size-4" />
          </Button>
        </Link>
      )}
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="border-2 border-black bg-white px-2 py-1 font-mono text-xs font-bold">
            …
          </span>
        ) : (
          <Link key={p} href={buildPageHref(searchParams, p)} aria-current={p === page ? 'page' : undefined}>
            <Button
              variant={p === page ? 'default' : 'default-outline'}
              size="sm"
              className={cn('cursor-default font-mono text-xs font-bold', p === page && '-translate-y-px')}
            >
              {p}
            </Button>
          </Link>
        )
      )}
      {page < totalPages && (
        <Link href={buildPageHref(searchParams, page + 1)} aria-label="Next page">
          <Button variant="default" size="sm">
            <ChevronRight className="size-4" />
          </Button>
        </Link>
      )}
    </nav>
  );
}

/**
 * Generates a windowed page number list with ellipsis gaps for large pagination ranges.
 *
 * @param {number} page - Current active page.
 * @param {number} total - Total number of pages.
 *
 * @returns {(number | '…')[]} Array of page numbers and ellipsis markers.
 */
function buildPageList(page: number, total: number): (number | '…')[] {
  const window = 1;
  const pages: (number | '…')[] = [];
  let lastWasGap = false;

  for (let i = 1; i <= total; i++) {
    const isEdge = i === 1 || i === total;
    const inWindow = i >= page - window && i <= page + window;
    if (isEdge || inWindow) {
      pages.push(i);
      lastWasGap = false;
    } else if (!lastWasGap) {
      pages.push('…');
      lastWasGap = true;
    }
  }

  return pages;
}
