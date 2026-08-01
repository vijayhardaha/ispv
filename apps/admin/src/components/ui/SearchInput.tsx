'use client';

import { useState, type SubmitEvent, type JSX } from 'react';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

/**
 * Search input that syncs its value to the `?q=` URL param on Enter or submit.
 *
 * Uses local state for keyboard feedback; submitting the form (Enter key or
 * the submit button) updates the URL, and the parent page reloads data from
 * the new URL params. The local value re-syncs from the URL whenever the
 * param changes externally (e.g. after Reset or browser back/forward).
 *
 * @param {object} props - Component properties.
 * @param {string} [props.placeholder] - Input placeholder text.
 * @param {string} [props.paramName] - URL search param name (default "q").
 * @param {string} [props.submitLabel] - Label for the submit button (default "Search").
 *
 * @returns {JSX.Element} Rendered search form with submit button.
 */
export function SearchInput({
  placeholder = 'Search\u2026',
  paramName = 'q',
  submitLabel = 'Search',
}: {
  placeholder?: string;
  paramName?: string;
  submitLabel?: string;
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

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    syncToUrl(value);
  };

  return (
    <form role="search" onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        type="search"
        name={paramName}
        id={`search-${paramName}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full max-w-xs"
      />
      <Button type="submit">
        <Search className="h-3.5 w-3.5" aria-hidden="true" />
        {submitLabel}
      </Button>
    </form>
  );
}
