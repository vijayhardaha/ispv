import type { JSX, ReactNode } from 'react';

import { Providers } from '@/app/Providers';

/**
 * Main content area with a skip-target anchor and Providers wrapper.
 *
 * Renders full-width within the right column of the sidebar layout,
 * with horizontal padding so pages control their own vertical rhythm.
 *
 * @param {{ children: ReactNode }} props - Component properties.
 * @param {ReactNode} props.children - Page content to render.
 *
 * @returns {JSX.Element} Rendered main element.
 */
export function AdminMain({ children }: { children: ReactNode }): JSX.Element {
  return (
    <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 px-6 py-6">
      <Providers>{children}</Providers>
    </main>
  );
}
