'use client';

import { type JSX } from 'react';

import { Container } from '@/components/ui/Container';

const REASONS = [
  'Concerns over competitive examination integrity',
  'Student frustration over repeated exam controversies',
  'Demands for institutional accountability',
  'Calls for educational reform and modernisation',
  'Amplification through social media and online organising',
  'Growing youth unemployment and economic anxiety',
];

/**
 * Lists the key reasons that sparked the student protest movement.
 *
 * @returns {JSX.Element} Rendered reasons grid section.
 */
export function WhyDidBeginSection(): JSX.Element {
  return (
    <section className="border-y-2 border-black bg-gray-100 py-12">
      <Container>
        <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase md:text-4xl">Why Did It Begin?</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {REASONS.map((item) => (
            <div key={item} className="shadow-brutal-sm flex items-center gap-3 border-2 border-black bg-white p-3">
              <div className="h-2 w-2 shrink-0 rounded-full bg-yellow-400" />
              <span className="text-xs leading-tight font-bold uppercase">{item}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
