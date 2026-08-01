import type { JSX } from 'react';

/**
 * Loading state displayed while page content is being fetched.
 *
 * @returns {JSX.Element} Rendered loading spinner.
 */
export default function Loading(): JSX.Element {
  return (
    <section className="flex min-h-[50vh] items-center justify-center p-6" role="status" aria-label="Loading">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-purple-600" />
        <p className="text-xs font-semibold text-gray-500">Loading&hellip;</p>
      </div>
    </section>
  );
}
