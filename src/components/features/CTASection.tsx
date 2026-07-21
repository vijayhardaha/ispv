import type { JSX } from 'react';

import Link from 'next/link';

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
          <a
            href="#submit"
            className="group relative inline-flex items-center justify-center overflow-hidden border-2 border-transparent bg-blue-600 px-8 py-4 font-bold tracking-wider text-white uppercase transition-all duration-300 hover:bg-blue-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <span className="relative z-10">Submit a Reel</span>
            <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
          </a>
          <Link
            href="/videos"
            className="group inline-flex items-center justify-center border-2 border-zinc-900 bg-transparent px-8 py-4 font-bold tracking-wider text-zinc-900 uppercase transition-all duration-300 hover:bg-zinc-900 hover:text-white hover:shadow-[4px_4px_0px_0px_rgba(234,179,8,1)]"
          >
            Browse the Archive
          </Link>
        </div>
      </Container>
    </section>
  );
}
