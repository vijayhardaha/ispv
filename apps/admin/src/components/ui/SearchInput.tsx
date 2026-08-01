'use client';

import { useState, type FormEvent, type JSX } from 'react';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

/**
 * Search input that syncs its value to the `?q=` URL param on Enter.
 *
 * Uses local state for keyboard feedback; submitting the form (Enter key)
 * updates the URL, and the parent page reloads data from the new URL params.
 * The local value re-syncs from the URL whenever the param changes
 * externally (e.g. after Reset or browser back/forward).
 *
 * @param {object} props - Component properties.
 * @param {string} [props.placeholder] - Input placeholder text.
 * @param {string} [props.paramName] - URL search param name (default "q").
 *
 * @returns {JSX.Element} Rendered search form.
 */
export function SearchInput({
  placeholder = 'Search\u2026',
  paramName = 'q',
}: {
  placeholder?: string;
  paramName?: string;
}): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlValue = searchParams.get(paramName) ?? '';
  const [value, setValue] = useState(urlValue);
  const [prevUrlValue, setPrevUrlValue] = useState(urlValue);

  // Re-sync from the URL when it changes externally (reset, back/forward).
  // Uses the render-time adjustment pattern so it never clobbers typing:
  // while typing, the URL param is untouched and this branch does not run.
  if (urlValue !== prevUrlValue) {
    setPrevUrlValue(urlValue);
    setValue(urlValue);
  }

  const syncToUrl = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set(paramName, val);
    } else {
      params.delete(paramName);
    }
    params.delete('page');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    syncToUrl(value);
  };

  return (
    <form role="search" onSubmit={handleSubmit}>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full max-w-xs border-2 border-black px-3 py-2 text-sm placeholder:text-black/30 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
      />
    </form>
  );
}
