'use client';

import type { JSX } from 'react';

import { Button } from '@/components/ui/Button';

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
        ...
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
 * Numbered pagination component with ellipsis for large page ranges.
 *
 * @param {object} props - Component properties.
 * @param {number} props.page - Current active page.
 * @param {number} props.totalPages - Total number of pages.
 * @param {(n: number) => void} props.onPageChange - Callback when a page is selected.
 *
 * @returns {JSX.Element | null} Rendered pagination or null if only one page.
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (n: number) => void;
}): JSX.Element | null {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-4 flex items-center justify-center gap-1" aria-label="Pagination">
      <Button disabled={page <= 1} onClick={() => onPageChange(page - 1)} variant="secondary" size="sm">
        Prev
      </Button>

      {getPageNumbers(page, totalPages, onPageChange)}

      <Button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} variant="secondary" size="sm">
        Next
      </Button>
    </nav>
  );
}
