'use client';

import { type JSX } from 'react';

import { ArrowLeft, Grid3x3 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';

/**
 * Hero section for a category page with name, description, and back link.
 *
 * @param {object} props - Component props.
 * @param {{ slug: string; name: string; description: string | null }} props.cat - Category record.
 * @param {string} props.value - Category slug from the URL.
 *
 * @returns {JSX.Element} Rendered category hero.
 */
export function CategoryHero({
  cat,
}: {
  cat: { slug: string; name: string; description: string | null };
  value: string;
}): JSX.Element {
  return (
    <section className="border-b-2 border-black bg-gray-100 py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Link
          href="/categories"
          className="inline-flex items-center gap-1 font-mono text-[10px] font-bold tracking-widest text-black/60 uppercase hover:text-black"
        >
          <ArrowLeft className="size-3" /> All categories
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1 border-2 border-black bg-yellow-400 px-2.5 py-0.5 font-mono text-xs font-bold uppercase">
              Category
            </span>
            <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight uppercase md:text-6xl">
              {cat.name}
            </h1>
            <p className="mt-1 max-w-2xl text-black/70">{cat.description}</p>
          </div>
          <Link href="/videos">
            <Button variant="default">
              <Grid3x3 className="size-4" /> View All Videos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
