'use client';

import { type JSX } from 'react';

import { ArrowRight, Globe } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

/**
 *
 */
export function WhereSpreadSection(): JSX.Element {
  return (
    <section className="py-12">
      <Container className="text-center">
        <Globe className="mx-auto h-10 w-10 text-black" />
        <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight uppercase md:text-4xl">
          Where Did It Spread?
        </h2>
        <p className="mt-3">
          Peaceful demonstrations have been documented in cities across India — from Delhi and Mumbai to smaller towns
          and university campuses. Our archive organises videos by state and city, making it possible to trace how the
          movement spread geographically.
        </p>
        <Link href="/categories">
          <Button variant="default" shadow className="mt-6">
            Browse by Location <ArrowRight className="size-4" />
          </Button>
        </Link>
      </Container>
    </section>
  );
}
