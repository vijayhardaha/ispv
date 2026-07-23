import { BookOpen, Heart } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react/jsx-runtime';

import { Container } from '@/components/ui/Container';

/**
 * Internal navigation link with optional anchor support.
 *
 * @type {InfoLink}
 * @augments LinkProps
 * @property {boolean} [isAnchor] - Whether to render as plain anchor instead of Next Link.
 */
interface InfoLink extends LinkProps {
  isAnchor?: boolean;
}

/**
 * External link entry used across navigation link lists.
 *
 * @type {LinkProps}
 * @property {string} label - Link display text.
 * @property {string} href - Full external URL.
 */
interface LinkProps {
  label: string;
  href: string;
}

const infoLinks: InfoLink[] = [
  { label: 'About the project', href: '/about' },
  { label: 'Browse categories', href: '/categories' },
  { label: 'All videos', href: '/videos' },
  { label: 'Sitemap', href: '/sitemap' },
  { label: 'DMCA', href: '/dmca' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

const usefulLinks: LinkProps[] = [
  { label: 'CJP (Cockroach Janta Party) Instagram', href: 'https://www.instagram.com/cockroachjantaparty/' },
  { label: 'BBC Search: CJP', href: 'https://www.bbc.com/search?q=cjp' },
  { label: 'The News Pinch on YouTube', href: 'https://www.youtube.com/@TheNewsPinch/videos' },
  { label: 'Bolta Hindustan on YouTube', href: 'https://www.youtube.com/@BoltaHindustan/videos' },
  { label: 'Scroll.in search: protest', href: 'https://scroll.in/search?q=protest&page=1' },
];

const resourceLinks: LinkProps[] = [
  { label: 'Know India — Government of India', href: 'https://knowindia.india.gov.in/' },
  { label: 'Freedom of speech in India', href: 'https://en.wikipedia.org/wiki/Freedom_of_speech_in_India' },
  { label: 'CJP Official Website', href: 'https://cockroachjanata.org/' },
  { label: 'Ministry of Education, Government of India', href: 'https://www.education.gov.in' },
];

const bottomLinks: LinkProps[] = [
  { label: 'Sitemap', href: '/sitemap' },
  { label: 'DMCA', href: '/dmca' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

/**
 * Renders a list of external links with anchor tags.
 *
 * @param {object} props - Component properties.
 * @param {LinkProps[]} props.links - External link entries.
 *
 * @returns {JSX.Element} Rendered external link list.
 */
function ExternalLinkList({ links }: { links: LinkProps[] }): JSX.Element {
  return (
    <ul className="mt-3 space-y-2 text-sm">
      {links.map((link) => (
        <li key={link.href}>
          <a className="hover:text-yellow-500" href={link.href} target="_blank" rel="noreferrer">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Renders a list of internal navigation links with optional anchor support.
 *
 * @param {object} props - Component properties.
 * @param {InfoLink[]} props.links - Internal link entries.
 *
 * @returns {JSX.Element} Rendered internal link list.
 */
function InternalLinkList({ links }: { links: InfoLink[] }): JSX.Element {
  return (
    <ul className="mt-3 space-y-2 text-sm">
      {links.map((link) => (
        <li key={link.href}>
          {link.isAnchor ? (
            <a className="text-zinc-400 hover:text-yellow-500" href={link.href}>
              {link.label}
            </a>
          ) : (
            <Link className="text-zinc-400 hover:text-yellow-500" href={link.href}>
              {link.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Renders a list of resource links with leading icons.
 *
 * @param {object} props - Component properties.
 * @param {LinkProps[]} props.links - Resource link entries with icons.
 *
 * @returns {JSX.Element} Rendered resource link list.
 */
function ResourceLinkList({ links }: { links: LinkProps[] }): JSX.Element {
  return (
    <ul className="mt-3 space-y-2 text-sm">
      {links.map((link) => (
        <li className="flex items-start gap-2" key={link.href}>
          <BookOpen className="mt-0.5 size-4 shrink-0 text-yellow-500" />
          <a className="hover:text-yellow-500" href={link.href} target="_blank" rel="noreferrer">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Footer section title with underline accent.
 *
 * @param {object} props - Component properties.
 * @param {object} props.children - Title text content.
 *
 * @returns {JSX.Element} Rendered widget title.
 */
function WidgetTitle({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <h4 className="font-display mb-6 text-sm font-extrabold tracking-tight text-white uppercase">
      <span className="border-b-2 border-yellow-400 pb-1">{children}</span>
    </h4>
  );
}

/**
 * Site-wide footer with branding, navigation links, resources, and disclaimer.
 *
 * @returns {JSX.Element} Rendered footer with multi-column layout.
 */
export function Footer(): JSX.Element {
  return (
    <footer className="border-t-2 border-black">
      <div className="bg-black text-zinc-400">
        <Container className="grid grid-cols-1 gap-10 py-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 text-yellow-500">
              <span className="font-display text-xl font-extrabold tracking-tight uppercase">
                Indian Students Protest Vault
              </span>
            </div>
            <p className="mt-3 text-sm">
              The story wasn&apos;t written. It was recorded. A searchable archive preserving publicly shared videos
              from student protests across India.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 md:col-span-8 md:grid-cols-3">
            {/* Info */}
            <div>
              <WidgetTitle>Info</WidgetTitle>
              <InternalLinkList links={infoLinks} />
            </div>

            {/* Useful links */}
            <div>
              <WidgetTitle>Useful Links</WidgetTitle>
              <ExternalLinkList links={usefulLinks} />
            </div>

            {/* Resources */}
            <div>
              <WidgetTitle>Resources</WidgetTitle>
              <ResourceLinkList links={resourceLinks} />
            </div>
          </div>
        </Container>

        <Container>
          <div className="flex flex-col items-start gap-6 py-6">
            <div className="flex items-start gap-2 text-sm text-zinc-400">
              <p>
                <span className="font-bold text-yellow-500 uppercase">Disclaimer:</span> Indian Students Protest Vault
                is an independent, non-partisan archive of publicly-shared Instagram reels. It is not affiliated with
                Instagram/Meta, the Government of India, or any political party. All clips remain the property of their
                original creators. If you are the video owner and believe a video should be removed, please DM{' '}
                <a
                  className="underline hover:text-yellow-500"
                  href="https://www.instagram.com/vegan.vijay/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @vegan.vijay
                </a>{' '}
                on Instagram with a valid removal reason. We review all requests within 48 hours. We do not host any
                media files — embeds point back to Instagram.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-sm tracking-widest text-zinc-400 uppercase">
              <span>Made with</span>
              <Heart className="size-4 fill-yellow-500 text-yellow-500" />
              <span>in India</span>
            </div>
          </div>
        </Container>

        <Container>
          <div className="flex flex-col items-center justify-between gap-6 border-t-2 border-zinc-800 py-8 text-zinc-400 md:flex-row">
            <p className="text-sm font-bold tracking-tight uppercase">
              <a
                href="https://ispv.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-yellow-400"
              >
                © 2026 Indian Students Protest Vault
              </a>
              . All rights reserved.
            </p>
            <div className="flex space-x-8">
              {bottomLinks.map((link) => (
                <a
                  key={link.label}
                  className="text-sm font-bold tracking-tight uppercase transition-colors hover:text-yellow-400"
                  href={link.href}
                  target="_self"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
