'use client';

import { type JSX } from 'react';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

/**
 *
 */
export function ClosingCtaSection(): JSX.Element {
  return (
    <section className="bg-black py-12">
      <Container className="flex flex-col items-center gap-4 text-center">
        <blockquote className="font-display text-2xl leading-tight font-extrabold text-white uppercase italic">
          &ldquo;Every recording is a piece of the story.&rdquo;
        </blockquote>
        <Link href="/videos">
          <Button variant="light" shadow>
            Browse the Archive <ArrowRight className="size-4" />
          </Button>
        </Link>
      </Container>
    </section>
  );
}
