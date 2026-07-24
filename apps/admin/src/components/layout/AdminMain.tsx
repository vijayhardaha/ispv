import type { JSX, ReactNode } from 'react';

import { Providers } from '@/app/Providers';
import { Container } from '@/components/ui/Container';

/**
 * Main content area with a skip-target anchor, Container wrapper, and Providers.
 *
 * @param {{ children: ReactNode }} props - Component properties.
 * @param {ReactNode} props.children - Page content to render.
 *
 * @returns {JSX.Element} Rendered main element.
 */
export function AdminMain({ children }: { children: ReactNode }): JSX.Element {
  return (
    <main id="main-content" tabIndex={-1} className="flex-1">
      <Container>
        <Providers>{children}</Providers>
      </Container>
    </main>
  );
}
