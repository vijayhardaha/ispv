'use client';

import { type JSX } from 'react';

import { Container } from '@/components/ui/Container';

export function MovementHero(): JSX.Element {
  return (
    <section className="border-b-2 border-black bg-black py-14 text-white">
      <Container>
        <div className="font-mono text-[10px] tracking-widest text-yellow-400 uppercase">/ Why Protest</div>
        <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight uppercase md:text-6xl">
          Why students are protesting?
        </h1>
        <p className="mt-4 max-w-3xl text-white/80">
          Understanding the origins, demands, timeline, and purpose behind the student movement documented in this
          archive.
        </p>
      </Container>
    </section>
  );
}
