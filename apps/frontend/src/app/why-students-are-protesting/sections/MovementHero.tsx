'use client';

import { type JSX } from 'react';

import { PageHero } from '@/components/shared/PageHero';

/**
 * Hero banner for the movement page with headline and introductory text.
 *
 * @returns {JSX.Element} Rendered hero section.
 */
export function MovementHero(): JSX.Element {
  return (
    <PageHero breadcrumb="Why Protest" title="Why students are protesting?">
      <p className="mt-2 text-white/80">
        Understanding the origins, demands, timeline, and purpose behind the student movement documented in this
        archive.
      </p>
    </PageHero>
  );
}
