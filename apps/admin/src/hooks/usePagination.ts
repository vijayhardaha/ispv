'use client';

import { useCallback } from 'react';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

/**
 * URL-based pagination hook for admin CRUD pages.
 * Reads/writes `?page=N` search param.
 *
 * @returns {{ page: number; goToPage: (newPage: number) => void }} Pagination state and setter.
 */
export function usePagination(): { page: number; goToPage: (newPage: number) => void } {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  const goToPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newPage <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(newPage));
      }

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );

  return { page, goToPage };
}
