'use client';

import { useCallback, useEffect, useRef, useState, type JSX } from 'react';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

/**
 * Search input that syncs its value to the `?q=` URL param with a debounce delay.
 * Uses local state for immediate keyboard feedback; the URL updates after the
 * debounce period and the parent page reacts to the new URL to reload data.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.placeholder] - Input placeholder text.
 * @param {number} [props.debounceMs] - Debounce delay in milliseconds.
 * @param {string} [props.paramName] - URL search param name (default "q").
 *
 * @returns {JSX.Element} Rendered search input.
 */
export function SearchInput({
  placeholder = 'Search\u2026',
  debounceMs = 300,
  paramName = 'q',
}: {
  placeholder?: string;
  debounceMs?: number;
  paramName?: string;
}): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(() => searchParams.get(paramName) ?? '');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const syncToUrl = useCallback(
    (val: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (val) {
        params.set(paramName, val);
      } else {
        params.delete(paramName);
      }
      params.delete('page');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams, paramName]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value;
      setValue(newVal);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => syncToUrl(newVal), debounceMs);
    },
    [syncToUrl, debounceMs]
  );

  return (
    <input
      type="search"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full max-w-xs border-2 border-black px-3 py-2 text-sm placeholder:text-black/30 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
    />
  );
}
