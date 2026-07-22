'use client';

import type { JSX } from 'react';

import { Button } from '@/components/ui/Button';

/**
 * Error boundary page displayed when an unhandled exception occurs.
 *
 * @param {{ error: Error & { digest?: string }; reset: () => void }} props - Component properties.
 * @param {Error & { digest?: string }} props.error - The error that was thrown.
 * @param {() => void} props.reset - Function to retry rendering.
 *
 * @returns {JSX.Element} Rendered error page.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  return (
    <main className="flex min-h-[50vh] items-center justify-center p-6" role="alert">
      <article className="w-full max-w-md border-2 border-black bg-white p-6 text-center shadow-[8px_8px_0px_0px_#18181b]">
        <h1 className="mb-2 text-2xl font-extrabold text-red-600 uppercase">Something went wrong</h1>
        <p className="mb-4 text-sm text-black/70">{error.message || 'An unexpected error occurred.'}</p>
        <Button onClick={reset}>Try Again</Button>
      </article>
    </main>
  );
}
