'use client';

import type { JSX } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Renders a range of page numbers with an ellipsis gap.
 *
 * @param {number} current - Current page.
 * @param {number} total - Total pages.
 * @param {(n: number) => void} onChange - Page change callback.
 *
 * @returns {JSX.Element[]} Page number button elements.
 */
function getPageNumbers(current: number, total: number, onChange: (n: number) => void): JSX.Element[] {
  const items: JSX.Element[] = [];
  const siblingCount = 1;
  const range = siblingCount + 3; // pages shown around current + first/last buffer

  const showLeftEllipsis = current > range;
  const showRightEllipsis = current < total - range + 1;

  const addPage = (n: number) => {
    items.push(
      <Button
        key={n}
        size="sm"
        variant={n === current ? 'primary' : 'secondary'}
        onClick={() => onChange(n)}
        className="min-w-[32px]"
      >
        {n}
      </Button>
    );
  };

  const addEllipsis = (key: string) => {
    items.push(
      <span key={key} className="px-1 text-xs font-bold text-black/40">
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
 * Optionally renders a "Showing X-Y from Z" results count when totalCount and perPage are provided.
 *
 * @param {object} props - Component properties.
 * @param {number} props.page - Current active page.
 * @param {number} props.totalPages - Total number of pages.
 * @param {(n: number) => void} props.onPageChange - Callback when a page is selected.
 * @param {number} [props.totalCount] - Total items across all pages, enables results label.
 * @param {number} [props.perPage] - Items per page, used to compute results label.
 * @param {string} [props.className] - Additional CSS classes to extend.
 *
 * @returns {JSX.Element | null} Rendered pagination or null when neither pager nor label is shown.
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  totalCount,
  perPage,
  className,
}: {
  page: number;
  totalPages: number;
  onPageChange: (n: number) => void;
  totalCount?: number;
  perPage?: number;
  className?: string;
}): JSX.Element | null {
  const hasPager = totalPages > 1;
  const hasLabel = totalCount !== undefined && perPage !== undefined;

  if (!hasPager && !hasLabel) {
    return null;
  }

  return (
    <nav className={cn('flex items-center justify-center gap-1', className)} aria-label="Pagination">
      {hasPager && (
        <div className="flex items-center gap-1">
          <Button disabled={page <= 1} onClick={() => onPageChange(page - 1)} variant="secondary" size="sm">
            Prev
          </Button>

          {getPageNumbers(page, totalPages, onPageChange)}

          <Button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} variant="secondary" size="sm">
            Next
          </Button>
        </div>
      )}

      {hasLabel && (
        <span className="ml-auto text-xs font-bold tracking-wide text-black/50 uppercase">
          {formatResultsLabel(clampPage(page, totalPages), perPage, totalCount)}
        </span>
      )}
    </nav>
  );
}
