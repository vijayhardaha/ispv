'use client';

import { useSearchParams } from 'next/navigation';

/**
 * URL-based pagination hook for admin CRUD pages.
 * Reads the `?page=N` search param. Navigation is handled by the
 * Pagination component which renders plain links that carry the page param,
 * so no programmatic setter is needed.
 *
 * @returns {{ page: number }} Pagination state read from the URL.
 */
export function usePagination(): { page: number } {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  return { page };
}
