import type { JSX } from 'react';

import type { Metadata } from 'next';

/**
 * Loading title used with the root layout template.
 */
export const metadata: Metadata = { title: 'Loading' };

/**
 * Loading state displayed while page content is being fetched.
 *
 * @returns {JSX.Element} Rendered loading spinner.
 */
export default function Loading(): JSX.Element {
  return (
    <section className="flex min-h-[50vh] items-center justify-center p-6" role="status" aria-label="Loading">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin border-2 border-black border-t-yellow-400" />
        <p className="text-xs font-bold text-black/50 uppercase">Loading&hellip;</p>
      </div>
    </section>
  );
}
