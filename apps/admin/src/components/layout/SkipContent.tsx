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
      className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-100 focus:border-2 focus:border-black focus:bg-yellow-400 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-black focus:uppercase"
    >
      Skip to content
    </a>
  );
}
