import type { JSX } from 'react';

import { breadcrumbSchema } from '@vijayhardaha/schema-builder';
import { JsonLd } from '@vijayhardaha/schema-builder/react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { Container } from '@/components/ui/Container';
import { buildMetadata } from '@/lib/meta';
import { buildBreadcrumbs, globalSchema } from '@/lib/schema';
import { siteUrl } from '@/lib/seo';

const PAGE_TITLE = 'Sitemap — Indian Students Protest Vault';
const PAGE_DESCRIPTION =
  'Browse all pages and sections of Indian Students Protest Vault — an archive of publicly shared videos documenting student protests across India.';
const PAGE_PATH = '/sitemap';
const ROOT_URL = siteUrl();

export const metadata: Metadata = buildMetadata({ title: PAGE_TITLE, description: PAGE_DESCRIPTION, path: PAGE_PATH });

const SCHEMA_DATA = [
  ...globalSchema(),
  breadcrumbSchema({ rootUrl: ROOT_URL, items: buildBreadcrumbs(PAGE_PATH, 'Sitemap') }),
];

const pages: { label: string; href: string; description: string }[] = [
  {
    label: 'Home',
    href: '/',
    description: 'Browse the archive, featured categories, and latest videos documenting student protests.',
  },
  {
    label: 'About',
    href: '/about',
    description: 'Learn about the mission, principles, and submission process behind the archive.',
  },
  {
    label: 'Videos',
    href: '/videos',
    description: 'Search and filter every indexed video by city, state, category, tags, and keyword.',
  },
  {
    label: 'Categories',
    href: '/categories',
    description: 'Explore videos grouped by protest category, topic, and movement theme.',
  },
  {
    label: 'Why Students Are Protesting',
    href: '/why-students-are-protesting',
    description: 'Context, background, and timeline of the student protest movement.',
  },
  {
    label: 'DMCA',
    href: '/dmca',
    description: 'Digital Millennium Copyright Act takedown notice and counter-notification policy.',
  },
  {
    label: 'Privacy Policy',
    href: '/privacy',
    description: 'Data-collection disclosures, embedded-content notices, and analytics details.',
  },
  {
    label: 'Terms of Service',
    href: '/terms',
    description: 'Usage rules, content ownership, and third-party-embedding terms.',
  },
];

/**
 * Human-readable sitemap page listing major sections of the archive.
 *
 * @returns {JSX.Element} Rendered sitemap page.
 */
export default function SitemapPage(): JSX.Element {
  return (
    <div>
      <JsonLd data={SCHEMA_DATA} />
      <div className="py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="font-mono text-[10px] tracking-widest text-yellow-500 uppercase">/ Sitemap</div>
            <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight uppercase md:text-5xl">Sitemap</h1>
            <p className="mt-3 leading-relaxed text-zinc-600">
              Every major section of Indian Students Protest Vault is listed below. If you are looking for a specific
              video, use the search filters on the Videos page or browse by category.
            </p>

            <section className="mt-10">
              <ul className="space-y-4">
                {pages.map((item) => (
                  <li key={item.href} className="shadow-brutal border-2 border-black bg-white p-5">
                    <Link href={item.href} className="group block">
                      <span className="font-display text-lg font-extrabold tracking-tight uppercase transition-colors group-hover:text-yellow-600">
                        {item.label}
                      </span>
                      <span className="mt-1 block font-mono text-xs text-zinc-500">{item.href}</span>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-700">{item.description}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </Container>
      </div>
    </div>
  );
}
