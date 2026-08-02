'use client';

import { type JSX } from 'react';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

/**
 * Explains the purpose and importance of the protest video archive.
 *
 * @returns {JSX.Element} Rendered archive purpose section.
 */
export function WhyThisArchiveExistsSection(): JSX.Element {
  return (
    <section className="border-y-2 border-black bg-yellow-400 py-12">
      <Container className="flex flex-col items-center text-center">
        <h2 className="font-display text-2xl font-extrabold tracking-tight uppercase md:text-3xl">
          Why This Archive Exists
        </h2>
        <p className="mt-4 max-w-2xl">
          Public demonstrations generate thousands of videos across Instagram. While each recording captures only one
          perspective, together they form a visual record of the movement. Indian Students Protest Vault organises these
          publicly shared videos by event, city, date, and topic so they remain easy to discover and explore.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link href="/videos">
            <Button variant="default" shadow>
              Explore the Archive <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="light" shadow>
              Learn More <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
