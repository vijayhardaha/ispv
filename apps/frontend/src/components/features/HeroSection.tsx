import type { JSX } from 'react';

import { ArrowRight, Play, Flag, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

/**
 * Homepage hero section with headline, call-to-action buttons, and stats.
 *
 * @param {object} props - Component props.
 * @param {number} [props.totalVideos] - Total number of archival videos.
 * @param {number} [props.totalCities] - Number of unique cities represented.
 * @param {number} [props.totalStates] - Number of unique states/UTs represented.
 *
 * @returns {JSX.Element} Rendered hero section.
 */
export function HeroSection({
  totalVideos = 0,
  totalCities = 0,
  totalStates = 0,
}: {
  totalVideos?: number;
  totalCities?: number;
  totalStates?: number;
}): JSX.Element {
  const fmt = (n: number) => {
    if (n >= 1000) {
      return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return String(n);
  };
  return (
    <section className="relative overflow-hidden border-b-2 border-black bg-gray-100">
      <Container className="grid grid-cols-1 gap-10 py-12 md:grid-cols-12 md:py-20">
        <div className="md:col-span-7">
          <div className="shadow-brutal-sm inline-flex items-center gap-2 border-2 border-black bg-yellow-400 px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest uppercase">
            <Sparkles className="h-3.5 w-3.5" /> People&apos;s Videos • By The People • For The People
          </div>

          <h1 className="font-display mt-5 text-5xl leading-[0.95] font-extrabold tracking-tight uppercase md:text-7xl">
            <span className="block">The History Wasn&apos;t Written.</span>
            <span className="block bg-linear-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              It Was Recorded.
            </span>
            <span className="block text-black">By the People.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-black/80 md:text-lg">
            Every video captures one perspective. Together, they preserve the timeline of student movements across
            India. This vault organizes publicly shared recordings by event, location, and date, making them easy to
            discover for years to come.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/categories">
              <Button variant="primary" size="lg">
                <Play className="h-5 w-5" /> Browse Categories
              </Button>
            </Link>
            <Link href="/videos">
              <Button variant="default-outline" size="lg">
                <Flag className="h-5 w-5" /> All Videos <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
            <Stat n={fmt(totalVideos) + '+'} label="Reels" />
            <Stat n={fmt(totalCities) + '+'} label="Cities" />
            <Stat n={String(totalStates)} label="States & UTs" />
          </div>
        </div>

        <div className="space-y-20 md:col-span-5">
          <div className="relative">
            <div className="shadow-brutal absolute -inset-2 -rotate-2 border-2 border-black bg-yellow-400" />
            <div className="shadow-brutal-lg relative border-2 border-black bg-white p-6">
              <p className="font-display mt-3 text-2xl leading-tight font-extrabold tracking-tighter uppercase md:text-3xl">
                Every student who pressed record became a witness to history.
              </p>
              <p className="mt-3 text-sm text-black/70">
                Every archived video is one student&apos;s perspective. Together, they preserve the collective memory of
                a movement.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="shadow-brutal absolute -inset-2 -rotate-2 border-2 border-black bg-green-400" />
            <div className="shadow-brutal-lg relative border-2 border-black bg-white p-6">
              <p className="font-display mt-3 text-2xl leading-tight font-extrabold tracking-tighter uppercase md:text-3xl">
                No single camera can tell the whole story.
              </p>
              <p className="mt-3 text-sm text-black/70">
                Every archived video captures one perspective. Together, they reveal the moments, voices, and
                experiences that shaped a movement.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * Statistic display box with a large number and small label.
 *
 * @param {object} props - Component properties.
 * @param {string} props.n - Statistic value to display.
 * @param {string} props.label - Descriptive label for the statistic.
 *
 * @returns {JSX.Element} Rendered stat box.
 */
function Stat({ n, label }: { n: string; label: string }): JSX.Element {
  return (
    <div className="shadow-brutal-sm border-2 border-black bg-white p-3">
      <div className="font-display text-2xl font-extrabold">{n}</div>
      <div className="font-mono text-[10px] font-bold tracking-widest text-black/60 uppercase">{label}</div>
    </div>
  );
}
