'use client';

import type { JSX } from 'react';

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
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="w-full max-w-md border-2 border-black bg-white p-6 text-center shadow-[8px_8px_0px_0px_#18181b]">
        <h1 className="mb-2 text-2xl font-extrabold text-red-600 uppercase">Something went wrong</h1>
        <p className="mb-4 text-sm text-black/70">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={reset}
          className="border-2 border-black bg-yellow-400 px-4 py-2 text-sm font-bold uppercase hover:bg-yellow-300"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
