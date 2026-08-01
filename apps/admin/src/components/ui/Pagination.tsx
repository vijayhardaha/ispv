'use client';

import type { JSX } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { cn } from '@/lib/utils';

/**
 * Renders a range of page number links with an ellipsis gap.
 * The current page is rendered as a static marker, all others as links.
 *
 * @param {number} current - Current page.
 * @param {number} total - Total pages.
 * @param {(n: number) => string} buildHref - Builds the href for a given page number.
 *
 * @returns {JSX.Element[]} Page number link elements.
 */
function getPageNumbers(current: number, total: number, buildHref: (n: number) => string): JSX.Element[] {
  const items: JSX.Element[] = [];
  const siblingCount = 1;
  const range = siblingCount + 3; // pages shown around current + first/last buffer

  const showLeftEllipsis = current > range;
  const showRightEllipsis = current < total - range + 1;

  const addPage = (n: number) => {
    const baseClass =
      'inline-flex min-w-8 h-8 items-center justify-center rounded-md border border-gray-300 px-2 text-xs font-semibold';
    if (n === current) {
      items.push(
        <span key={n} className={cn(baseClass, 'border-purple-600 bg-purple-600 text-white')} aria-current="page">
          {n}
        </span>
      );
      return;
    }
    items.push(
      <Link key={n} href={buildHref(n)} className={cn(baseClass, 'bg-white text-gray-700 hover:bg-gray-100')}>
        {n}
      </Link>
    );
  };

  const addEllipsis = (key: string) => {
    items.push(
      <span key={key} className="px-1 text-xs font-semibold text-gray-400">
        …
      </span>
    );
  };

  if (total <= 7) {
    for (let i = 1; i <= total; i++) addPage(i);
    return items;
  }

  if (!showLeftEllipsis) {
    for (let i = 1; i <= range + siblingCount; i++) addPage(i);
    addEllipsis('right-ellipsis');
    addPage(total);
  } else if (!showRightEllipsis) {
    addPage(1);
    addEllipsis('left-ellipsis');
    for (let i = total - range - siblingCount + 1; i <= total; i++) addPage(i);
  } else {
    addPage(1);
    addEllipsis('left-ellipsis');
    for (let i = current - siblingCount; i <= current + siblingCount; i++) addPage(i);
    addEllipsis('right-ellipsis');
    addPage(total);
  }

  return items;
}

/**
 * Formats a "Showing X-Y from Z" label for the current page range.
 *
 * @param {number} page - Current active page.
 * @param {number} perPage - Number of items displayed per page.
 * @param {number} totalCount - Total number of items across all pages.
 *
 * @returns {string} Formatted results range label.
 */
function formatResultsLabel(page: number, perPage: number, totalCount: number): string {
  if (totalCount === 0) {
    return 'Showing 0 from 0';
  }
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, totalCount);
  return `Showing ${from}-${to} from ${totalCount}`;
}

/**
 * Clamps the current page to the valid page range for label computation.
 *
 * @param {number} page - Current page from URL params.
 * @param {number} totalPages - Total number of pages.
 *
 * @returns {number} Clamped page within the valid range.
 */
function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(page, 1), totalPages);
}

/**
 * Numbered pagination component with ellipsis for large page ranges.
 *
 * Renders plain links (no onClick handlers) that carry the `page` URL param,
 * preserving all other search params. Optionally renders a
 * "Showing X-Y from Z" results count when totalCount and perPage are provided.
 *
 * @param {object} props - Component properties.
 * @param {number} props.page - Current active page.
 * @param {number} props.totalPages - Total number of pages.
 * @param {number} [props.totalCount] - Total items across all pages, enables results label.
 * @param {number} [props.perPage] - Items per page, used to compute results label.
 * @param {string} [props.className] - Additional CSS classes to extend.
 *
 * @returns {JSX.Element | null} Rendered pagination or null when neither pager nor label is shown.
 */
export function Pagination({
  page,
  totalPages,
  totalCount,
  perPage,
  className,
}: {
  page: number;
  totalPages: number;
  totalCount?: number;
  perPage?: number;
  className?: string;
}): JSX.Element | null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasPager = totalPages > 1;
  const hasLabel = totalCount !== undefined && perPage !== undefined;

  if (!hasPager && !hasLabel) {
    return null;
  }

  const buildHref = (n: number): string => {
    const params = new URLSearchParams(searchParams.toString());
    if (n <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(n));
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const navBase =
    'inline-flex min-w-8 h-8 items-center justify-center rounded-md border border-gray-300 px-2 text-xs font-semibold';
  const enabledClass = cn(navBase, 'bg-white text-gray-700 hover:bg-gray-100');
  const disabledClass = cn(navBase, 'bg-white text-gray-400');

  return (
    <nav className={cn('flex items-center justify-center gap-1', className)} aria-label="Pagination">
      {hasPager && (
        <div className="flex items-center gap-1">
          {page <= 1 ? (
            <span className={disabledClass} aria-disabled="true" aria-label="Previous page">
              <ChevronLeft className="size-4" aria-hidden="true" />
            </span>
          ) : (
            <Link href={buildHref(page - 1)} className={enabledClass} aria-label="Previous page">
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Link>
          )}

          {getPageNumbers(page, totalPages, buildHref)}

          {page >= totalPages ? (
            <span className={disabledClass} aria-disabled="true" aria-label="Next page">
              <ChevronRight className="size-4" aria-hidden="true" />
            </span>
          ) : (
            <Link href={buildHref(page + 1)} className={enabledClass} aria-label="Next page">
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      )}

      {hasLabel && (
        <span className="ml-auto text-xs font-semibold tracking-wide text-gray-500">
          {formatResultsLabel(clampPage(page, totalPages), perPage, totalCount)}
        </span>
      )}
    </nav>
  );
}
