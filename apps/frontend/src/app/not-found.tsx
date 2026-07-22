import Link from 'next/link';
import type { JSX } from 'react/jsx-runtime';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

/**
 * 404 page displayed when a route or resource is not found.
 *
 * @returns {JSX.Element} Rendered not-found page with link back to home.
 */
export default function NotFound(): JSX.Element {
  return (
    <Container className="py-20 text-center">
      <h1 className="font-display text-5xl font-extrabold uppercase">404</h1>
      <p className="mt-2 text-black/70">The page you&apos;re looking for has been moved or never existed.</p>
      <div className="mt-6">
        <Button variant="default" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </Container>
  );
}
