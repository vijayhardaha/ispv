'use client';

import type { JSX } from 'react';

import { FileText, Flag, Heart, Shield, ShieldAlert, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';

import { SectionHeader } from '@/components/shared/SectionHeader';
import { Container } from '@/components/ui/Container';
import type { DbCategory } from '@/lib/db';

/**
 * Lucide icon components keyed by featured category slug for the quick-link cards.
 */
const FEATURED_ICONS: Record<string, typeof Flag> = {
  'protest-marches': Flag,
  'police-conduct': Shield,
  'gen-z-movement': Users,
  'acts-of-kindness': Heart,
  'women-leading': Users,
  'human-rights': ShieldAlert,
};

/**
 * Fallback Lucide icon used when a category slug has no matching icon entry.
 */
const FALLBACK_ICON = FileText;

/**
 * Featured videos section with quick category links displayed as a card grid.
 *
 * @param {object} props - Component props.
 * @param {DbCategory[]} props.categories - Featured category entries from the database.
 *
 * @returns {JSX.Element} Rendered featured videos section.
 */
export function FeaturedVideos({ categories }: { categories: DbCategory[] }): JSX.Element {
  return (
    <section className="border-b-2 border-black bg-yellow-400 py-12 md:py-16">
      <Container>
        <SectionHeader
          tagVariant="black"
          tagText="Featured"
          tagIcon={<Sparkles className="inline size-3" />}
          heading={
            <>
              Watch These{' '}
              <span className="bg-linear-to-r from-red-600 to-red-500 bg-clip-text text-transparent">First</span>
            </>
          }
          description="Browse by theme — each category collects verified submissions from across India. (थीम के अनुसार ब्राउज़ करें — प्रत्येक श्रेणी में भारत भर से सत्यापित सबमिशन शामिल हैं।)"
          href="/categories"
          buttonText="View categories"
          className="border-b-4"
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const Icon = FEATURED_ICONS[cat.slug] ?? FALLBACK_ICON;
            return (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="group shadow-brutal hover:shadow-brutal-lg flex items-start gap-4 border-2 border-black bg-white p-5 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <div className="flex size-12 shrink-0 items-center justify-center border-2 border-black bg-yellow-400">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-extrabold tracking-tight uppercase">{cat.name}</h3>
                  <p className="mt-0.5 text-sm text-black/70">{cat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
