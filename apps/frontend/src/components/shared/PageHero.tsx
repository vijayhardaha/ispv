import type { JSX, ReactNode } from 'react';

import { Container } from '@/components/ui/Container';

interface PageHeroProps {
  breadcrumb: string;
  title: string;
  children: ReactNode;
}

/**
 * Reusable hero banner for content pages — black background, yellow breadcrumb,
 * bold heading, and intro text via children.
 *
 * @param {object} props - Component properties.
 * @param {string} props.breadcrumb - Short label shown above the title.
 * @param {string} props.title - Main heading text.
 * @param {ReactNode} props.children - Paragraphs or elements below the title.
 *
 * @returns {JSX.Element} Rendered hero section.
 */
export function PageHero({ breadcrumb, title, children }: PageHeroProps): JSX.Element {
  return (
    <section className="border-b-2 border-black bg-black py-10 text-white">
      <Container>
        <div className="font-mono text-[10px] tracking-widest text-yellow-500 uppercase">/ {breadcrumb}</div>
        <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight uppercase md:text-6xl">{title}</h1>
        {children}
      </Container>
    </section>
  );
}
