import type { JSX } from 'react';

import { aboutPageSchema, breadcrumbSchema } from '@vijayhardaha/schema-builder';
import { JsonLd } from '@vijayhardaha/schema-builder/react';
import { ArrowRight, Check, X, Search, Link2, Eye, BookOpen } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { PageHero } from '@/components/shared/PageHero';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/cn';
import { buildMetadata } from '@/lib/meta';
import { buildBreadcrumbs, globalSchema } from '@/lib/schema';
import { siteUrl } from '@/lib/seo';

const title = 'About — Indian Students Protest Vault';
const description =
  'Learn about the Indian Students Protest Vault — an independent archive of publicly shared videos documenting student protests across India. Our principles, submission process, and mission.';
const path = '/about';
const rootUrl = siteUrl();

export const metadata: Metadata = buildMetadata({ title, description, path });

const schemaData = [
  ...globalSchema(),
  aboutPageSchema({ rootUrl, path, breadcrumb: true }, { name: title, description }),
  breadcrumbSchema({ rootUrl, items: buildBreadcrumbs(path, 'About') }),
];

const PRINCIPLES = [
  {
    icon: <Link2 className="h-6 w-6" />,
    title: 'Public Recordings',
    body: 'We archive only videos that have been publicly shared by their original creators. Every video remains embedded from its original Instagram post whenever possible.',
    color: 'bg-yellow-400',
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: 'Preservation, Not Persuasion',
    body: 'This archive exists to organize public recordings, not to promote a political party, endorse opinions, or rewrite events. Every video represents the perspective of the person who recorded it.',
    color: 'bg-cyan-400 text-white',
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: 'Attribution Matters',
    body: 'Every embedded video links directly to its original creator. Credit remains with the people who documented the moment.',
    color: 'bg-red-400 text-white',
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: 'Searchable History',
    body: 'Videos are organized by state, city, event, date, creator, and topic, making it possible to explore a movement from multiple perspectives instead of isolated posts.',
    color: 'bg-green-400',
  },
];

const STEPS = [
  { n: 1, title: 'Discover', body: 'Find a publicly shared Instagram Reel documenting a student protest.' },
  {
    n: 2,
    title: 'Submit',
    body: 'Paste the public Instagram URL through the submission form and optionally add useful tags or event information.',
  },
  {
    n: 3,
    title: 'Review',
    body: 'Each submission is checked to ensure the link works, the content is publicly accessible, and the metadata is accurate.',
  },
  {
    n: 4,
    title: 'Archive',
    body: 'Approved videos become part of the archive and can be discovered through search, events, locations, and categories.',
  },
];

const INCLUDED = [
  'Peaceful marches',
  'Student speeches',
  'Public meetings',
  'Press interactions',
  'Eyewitness recordings',
  'Campus demonstrations',
  'Cultural and awareness events related to student movements',
];

const EXCLUDED = [
  'Private content',
  'Videos without a public source',
  'Edited compilations without attribution',
  'Spam or duplicate submissions',
  'Content removed by its original creator',
];

/**
 * About page explaining the archive's principles, submission process, and mission.
 *
 * @returns {JSX.Element} Rendered about page.
 */
export default function AboutPage(): JSX.Element {
  return (
    <div>
      <JsonLd data={schemaData} />
      {/* Hero */}
      <PageHero breadcrumb="About" title="What is Indian Students Protest Vault?">
        <p className="mt-2 text-white/80">
          Indian Students Protest Vault is an independent archive of publicly shared videos documenting student protests
          across India.
        </p>
        <p className="mt-1 text-white/70">
          Every protest leaves behind thousands of recordings. They are scattered across social media, difficult to
          search, and often disappear over time. This archive brings those public videos together into one searchable
          collection, organized by event, location, date, and topic.
        </p>
        <p className="mt-2 text-yellow-400/80">
          Our purpose is simple: preserve public recordings so they remain easy to discover today and valuable tomorrow.
        </p>
      </PageHero>

      {/* Principles */}
      <section className="py-12">
        <Container>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <Principle key={p.title} icon={p.icon} title={p.title} color={p.color}>
                {p.body}
              </Principle>
            ))}
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="border-y-2 border-black bg-gray-100 py-12">
        <Container>
          <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase md:text-4xl">How It Works</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {STEPS.map((s) => (
              <Step key={s.n} n={s.n} title={s.title}>
                {s.body}
              </Step>
            ))}
          </div>
        </Container>
      </section>

      {/* What We Archive / What We Don't */}
      <section className="py-12">
        <Container>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h3 className="font-display text-2xl font-extrabold tracking-tight uppercase">What We Archive</h3>
              <ul className="mt-4 space-y-2">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-2xl font-extrabold tracking-tight uppercase">
                What We Don&apos;t Archive
              </h3>
              <ul className="mt-4 space-y-2">
                {EXCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <X className="mt-0.5 size-4 shrink-0 text-red-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Why This Matters */}
      <section className="border-y-2 border-black bg-gray-100 py-12">
        <Container>
          <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase md:text-4xl">
            Why This Matters
          </h2>
          <p className="mt-4 leading-relaxed text-black/80">History is rarely experienced from a single camera.</p>
          <p className="mt-3 leading-relaxed text-black/80">
            Thousands of students record the same event from different streets, different cities, and different
            perspectives. Individually, each video captures a moment. Together, they preserve the memory of a movement.
          </p>
          <p className="mt-3 leading-relaxed text-black/80">
            Indian Students Protest Vault exists to ensure those publicly shared recordings remain organized,
            searchable, and accessible for anyone seeking to understand these moments through the people who witnessed
            them.
          </p>
        </Container>
      </section>

      {/* Closing CTA */}
      <section className="bg-yellow-400 py-12">
        <Container className="flex flex-col items-center gap-4 text-center">
          <blockquote className="font-display text-2xl leading-tight font-extrabold uppercase italic">
            &ldquo;The story wasn&apos;t written. It was recorded.&rdquo;
          </blockquote>
          <Link href="/videos">
            <Button variant="default" shadow>
              Explore the Archive <ArrowRight className="size-4" />
            </Button>
          </Link>
        </Container>
      </section>
    </div>
  );
}

/**
 * Principle card with icon, title, and description body.
 *
 * @param {object} props - Component properties.
 * @param {object} props.icon - Icon element to display.
 * @param {string} props.title - Principle title.
 * @param {object} props.children - Description body text.
 * @param {string} props.color - Tailwind background colour classes.
 *
 * @returns {JSX.Element} Rendered principle card.
 */
function Principle({
  icon,
  title,
  children,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  color: string;
}): JSX.Element {
  return (
    <div className={cn('shadow-brutal border-2 border-black p-5', color)}>
      <div className="shadow-brutal-sm mb-2 flex size-12 items-center justify-center border-2 border-black bg-white text-black">
        {icon}
      </div>
      <h3 className="font-display text-2xl font-extrabold uppercase">{title}</h3>
      <p className="mt-3 leading-relaxed">{children}</p>
    </div>
  );
}

/**
 * Numbered step card with a step number, title, and description.
 *
 * @param {object} props - Component properties.
 * @param {number} props.n - Step number.
 * @param {string} props.title - Step title.
 * @param {object} props.children - Step description text.
 *
 * @returns {JSX.Element} Rendered step card.
 */
function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="shadow-brutal flex items-start gap-4 border-2 border-black bg-white p-4">
      <div className="font-display shadow-brutal-sm flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-yellow-400 text-lg font-extrabold">
        {n}
      </div>
      <div>
        <h4 className="font-display text-lg font-extrabold uppercase">{title}</h4>
        <p className="mt-1 text-black/80">{children}</p>
      </div>
    </div>
  );
}
