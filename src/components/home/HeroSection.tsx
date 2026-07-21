import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Chakra, FlagStripe } from "@/components/flags/FlagStripe";
import { ArrowRight, Play, Flag, Sparkles } from "lucide-react";
import { SLOGANS_PULL_QUOTES } from "@/data/slogans";

export function HeroSection() {
  const quote = SLOGANS_PULL_QUOTES[0];
  return (
    <section className="relative overflow-hidden border-b-3 border-ink bg-paper">
      <FlagStripe className="absolute inset-x-0 top-0 z-10" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 md:grid-cols-12 md:px-6 md:py-20">
        <div className="md:col-span-7">
          <div className="inline-flex items-center gap-2 border-3 border-ink bg-saffron px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest shadow-brutal-sm">
            <Sparkles className="h-3.5 w-3.5" /> A peaceful archive, by the people, for the people
          </div>

          <h1 className="mt-5 font-display text-5xl font-extrabold uppercase leading-[0.95] tracking-tight md:text-7xl">
            <span className="block">India's streets,</span>
            <span className="block bg-saffron px-2 -mx-1 shadow-brutal-sm">
              on record.
            </span>
            <span className="block text-navy">Reel by reel.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-ink/80 md:text-lg">
            Every march, every candle, every quiet chant — collected from
            Instagram and indexed by city, category, and hashtag. No noise,
            no spin. Just the country, talking to itself in public.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/categories">
              <Button variant="primary" size="lg">
                <Play className="h-5 w-5 fill-ink" /> Browse Categories
              </Button>
            </Link>
            <Link to="/videos">
              <Button variant="info" size="lg">
                <Flag className="h-5 w-5" /> All Videos <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
            <Stat n="2.4K" label="Reels" />
            <Stat n="180+" label="Cities" />
            <Stat n="28" label="States & UTs" />
          </div>
        </div>

        {/* Right card — pulled quote with Indian flag motif */}
        <div className="md:col-span-5">
          <div className="relative">
            <div className="absolute -inset-2 -rotate-2 border-3 border-ink bg-sun shadow-brutal" />
            <div className="relative border-3 border-ink bg-white p-6 shadow-brutal-lg">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
                <Chakra className="h-5 w-5 text-navy" />
                <span>From the archive</span>
              </div>
              <p className="mt-3 font-display text-2xl font-extrabold leading-tight md:text-3xl">
                {quote}
              </p>
              <p className="mt-3 text-sm text-ink/70">
                Peaceful protest is the most powerful language a democracy
                speaks. We just keep the tape rolling.
              </p>
              <div className="mt-5 border-t-3 border-ink pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center border-3 border-ink bg-saffron shadow-brutal-sm">
                    <Chakra className="h-7 w-7 text-navy" />
                  </div>
                  <div className="leading-tight">
                    <div className="font-display text-base font-extrabold uppercase">
                      The Vault Collective
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
                      Independent · Non-partisan
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FlagStripe className="absolute inset-x-0 bottom-0" />
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="border-3 border-ink bg-white p-3 shadow-brutal-sm">
      <div className="font-display text-2xl font-extrabold">{n}</div>
      <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
        {label}
      </div>
    </div>
  );
}