'use client';

import type { JSX } from 'react';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { SubmitVideoDialog } from '@/components/features/SubmitVideoDialog';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

/**
 * Call-to-action section encouraging users to submit reels or browse the archive.
 *
 * @returns {JSX.Element} Rendered CTA section.
 */
export function CTASection(): JSX.Element {
  return (
    <section className="bg-yellow-400 py-14">
      <Container className="text-center">
        <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase md:text-5xl">
          Got a reel the world should see?
        </h2>
        <p className="mt-3 text-black/80">
          If you filmed something peaceful and public, submit the URL. We&apos;ll add it to the archive and the next
          person scrolling will see it.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <SubmitVideoDialog
            trigger={
              <Button variant="light" size="lg">
                Submit a Video
              </Button>
            }
          />
          <Button variant="default-outline" size="lg" asChild>
            <Link href="/videos">
              Browse the Archive <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
