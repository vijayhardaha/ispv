import { ArrowRight, Play, Flag, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react/jsx-runtime';

import { Chakra } from '@/components/flags/FlagStripe';
import { Button } from '@/components/ui/Button';
import { SLOGANS_PULL_QUOTES } from '@/data/slogans';

/**
 * Landing page hero with headline, tagline, stats, and pull quote.
 *
 * @returns {JSX.Element} Rendered hero section with CTA buttons and quote card.
 */
export function HeroSection(): JSX.Element {
  const quote = SLOGANS_PULL_QUOTES[0];
  return (
    <section className="relative overflow-hidden border-b-[3px] border-black bg-gray-100">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 md:grid-cols-12 md:px-6 md:py-20">
        <div className="md:col-span-7">
          <div className="shadow-brutal-sm inline-flex items-center gap-2 border-[3px] border-black bg-orange-500 px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest uppercase">
            <Sparkles className="h-3.5 w-3.5" /> A peaceful archive, by the people, for the people
          </div>

          <h1 className="font-display mt-5 text-5xl leading-[0.95] font-extrabold tracking-tight uppercase md:text-7xl">
            <span className="block">India&apos;s streets,</span>
            <span className="block bg-linear-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              on record.
            </span>
            <span className="block text-[#0a0a0c]">Reel by reel.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-black/80 md:text-lg">
            Every march, every candle, every quiet chant — collected from Instagram and indexed by city, category, and
            hashtag. No noise, no spin. Just the country, talking to itself in public.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/categories">
              <Button variant="primary" size="lg">
                <Play className="h-5 w-5" /> Browse Categories
              </Button>
            </Link>
            <Link href="/videos">
              <Button variant="dark-outline" size="lg">
                <Flag className="h-5 w-5" /> All Videos <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
            <Stat n="2.4K" label="Reels" />
            <Stat n="180+" label="Cities" />
            <Stat n="28" label="States & UTs" />
          </div>
        </div>

        {/* Right card — pulled quote with Indian flag motif */}
        <div className="md:col-span-5">
          <div className="relative">
            <div className="shadow-brutal absolute -inset-2 -rotate-2 border-[3px] border-black bg-yellow-400" />
            <div className="shadow-brutal-lg relative border-[3px] border-black bg-white p-6">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-black/60 uppercase">
                <Chakra className="h-5 w-5 text-[#0a0a0c]" />
                <span>From the archive</span>
              </div>
              <p className="font-display mt-3 text-2xl leading-tight font-extrabold md:text-3xl">{quote}</p>
              <p className="mt-3 text-sm text-black/70">
                Peaceful protest is the most powerful language a democracy speaks. We just keep the tape rolling.
              </p>
              <div className="mt-5 border-t-[3px] border-black pt-4">
                <div className="flex items-center gap-3">
                  <div className="shadow-brutal-sm flex h-12 w-12 items-center justify-center border-[3px] border-black bg-orange-500">
                    <Chakra className="h-7 w-7 text-[#0a0a0c]" />
                  </div>
                  <div className="leading-tight">
                    <div className="font-display text-base font-extrabold uppercase">The Vault Collective</div>
                    <div className="font-mono text-[10px] tracking-widest text-black/60 uppercase">
                      Independent · Non-partisan
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="shadow-brutal-sm border-[3px] border-black bg-white p-3">
      <div className="font-display text-2xl font-extrabold">{n}</div>
      <div className="font-mono text-[10px] font-bold tracking-widest text-black/60 uppercase">{label}</div>
    </div>
  );
}
