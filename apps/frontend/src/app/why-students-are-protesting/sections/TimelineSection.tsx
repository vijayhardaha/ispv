'use client';

import { type JSX } from 'react';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Container } from '@/components/ui/Container';
import { TIMELINE_ITEMS } from '@/constants/why-protest-data';

/**
 * Renders a chronological timeline of key protest events.
 *
 * @returns {JSX.Element} Rendered timeline section.
 */
export function TimelineSection(): JSX.Element {
  return (
    <section className="py-12">
      <Container>
        <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase md:text-4xl">Timeline</h2>
        <div className="relative mt-8 space-y-0">
          <div className="absolute top-3 left-4.25 h-[calc(100%-24px)] w-2 bg-black" />
          {TIMELINE_ITEMS.map((item, i) => (
            <div key={item.label} className="relative flex gap-5 pb-8 last:pb-0">
              <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center border-2 border-black bg-yellow-400">
                <span className="font-display text-xs font-extrabold">{i + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[10px] tracking-widest text-black/60 uppercase">{item.year}</span>
                  <span className="font-display text-base font-extrabold uppercase">{item.label}</span>
                </div>
                <p className="mt-0.5">{item.description}</p>
                <Link
                  href="/videos"
                  className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] tracking-widest text-yellow-400 underline underline-offset-2 hover:text-black"
                >
                  Browse related videos <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
