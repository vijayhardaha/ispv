'use client';

import { type JSX } from 'react';

import { Container } from '@/components/ui/Container';
import { DEMANDS } from '@/constants/whyProtestContent';
import { cn } from '@/lib/cn';

/**
 *
 */
export function CoreDemandsSection(): JSX.Element {
  return (
    <section className="border-y-2 border-black bg-gray-100 py-12">
      <Container>
        <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase md:text-4xl">Core Demands</h2>
        <p className="mt-2">
          The movement publicly advocates for the following principles, reflected in its published manifesto and
          official communications.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DEMANDS.map((d) => (
            <div key={d.title} className={cn('shadow-brutal border-2 border-black p-5', d.color)}>
              <div className="flex items-center gap-2">
                <div className="shadow-brutal-sm border-2 border-black bg-white p-1.5 text-black">{d.icon}</div>
                <h3 className="font-display text-lg font-extrabold uppercase">{d.title}</h3>
              </div>
              <p className="mt-3">{d.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-black/50">
          Disclaimer: This demand data is gathered from public internet sources. Please check official movement
          communications for the most accurate and current information.
        </p>
      </Container>
    </section>
  );
}
