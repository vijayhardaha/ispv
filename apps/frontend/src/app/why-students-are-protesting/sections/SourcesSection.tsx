'use client';

import { type JSX } from 'react';

import { ExternalLink } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { SOURCES } from '@/constants/whyProtestContent';

export function SourcesSection(): JSX.Element {
  return (
    <section className="py-12">
      <Container>
        <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase md:text-4xl">Sources</h2>
        <p className="mt-2">Information on this page is drawn from the following publicly available sources.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {SOURCES.map((source) => (
            <a
              key={source.title}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shadow-brutal group block border-2 border-black bg-white p-4 transition-colors hover:bg-yellow-400"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg font-extrabold uppercase">{source.title}</h3>
                <ExternalLink className="mt-0.5 size-4 shrink-0 text-black/40 transition-colors group-hover:text-black" />
              </div>
              <p className="mt-1">{source.description}</p>
            </a>
          ))}
        </div>
        <p className="mt-6 text-xs leading-relaxed text-black/60">
          This page is for informational purposes. For the most current and detailed information, refer to the original
          source materials linked above.
        </p>
      </Container>
    </section>
  );
}
