import type { ReactNode } from 'react';

import { BookOpen, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { JSX } from 'react/jsx-runtime';

import { Container } from '@/components/ui/Container';
import {
  FOOTER_BOTTOM_LINKS,
  FOOTER_INFO_LINKS,
  FOOTER_RESOURCE_LINKS,
  FOOTER_USEFUL_LINKS,
  type FooterInfoLink,
  type NavLink,
} from '@/constants/navlinks';

/**
 * Renders a list of external links with anchor tags.
 *
 * @param {object} props - Component properties.
 * @param {NavLink[]} props.links - External link entries.
 *
 * @returns {JSX.Element} Rendered external link list.
 */
function ExternalLinkList({ links }: { links: NavLink[] }): JSX.Element {
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
 * @param {FooterInfoLink[]} props.links - Internal link entries.
 *
 * @returns {JSX.Element} Rendered internal link list.
 */
function InternalLinkList({ links }: { links: FooterInfoLink[] }): JSX.Element {
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
 * @param {NavLink[]} props.links - Resource link entries with icons.
 *
 * @returns {JSX.Element} Rendered resource link list.
 */
function ResourceLinkList({ links }: { links: NavLink[] }): JSX.Element {
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
function WidgetTitle({ children }: { children: ReactNode }): JSX.Element {
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
            <div className="flex flex-col gap-2 text-yellow-500">
              <Image src="/logo.svg" alt="Indian Students Protest Vault" width={40} height={21} />
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
              <InternalLinkList links={FOOTER_INFO_LINKS} />
            </div>

            {/* Useful links */}
            <div>
              <WidgetTitle>Useful Links</WidgetTitle>
              <ExternalLinkList links={FOOTER_USEFUL_LINKS} />
            </div>

            {/* Resources */}
            <div>
              <WidgetTitle>Resources</WidgetTitle>
              <ResourceLinkList links={FOOTER_RESOURCE_LINKS} />
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
              {FOOTER_BOTTOM_LINKS.map((link) => (
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
