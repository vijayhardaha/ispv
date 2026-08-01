import type { JSX } from 'react';

/**
 * Skip-to-content link for keyboard and screen-reader users.
 * Visible only on focus, moves focus to #main-content when activated.
 *
 * @returns {JSX.Element} Rendered skip-link anchor.
 */
export function SkipContent(): JSX.Element {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-100 focus:bg-purple-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
    >
      Skip to content
    </a>
  );
}
