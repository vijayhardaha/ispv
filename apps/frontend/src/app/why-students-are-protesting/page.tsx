import type { JSX } from 'react';

import { ArrowRight, BookOpen, CheckCircle, ExternalLink, Globe, Heart, Shield, Users } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/cn';

const DEMANDS = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Transparent Governance',
    body: 'Demand for greater transparency in public examinations and institutional decision-making processes.',
    color: 'bg-yellow-400',
  },
  {
    icon: <CheckCircle className="h-6 w-6" />,
    title: 'Public Accountability',
    body: 'Calls for accountability from public institutions regarding repeated examination irregularities.',
    color: 'bg-black text-white',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Community Representation',
    body: 'Advocacy for including student and youth voices in discussions about educational policy and reform.',
    color: 'bg-blue-600 text-white',
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: 'Youth Participation',
    body: 'Encouraging young citizens to engage with democratic processes and hold institutions accountable.',
    color: 'bg-yellow-400',
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: 'Institutional Reform',
    body: 'Push for systematic reforms to examination frameworks, hiring practices, and institutional oversight.',
    color: 'bg-black text-white',
  },
];

const TIMELINE_ITEMS = [
  {
    year: 'Early 2025',
    label: 'Origins',
    description: 'Student concerns over examination integrity begin circulating online.',
  },
  {
    year: 'Mid 2025',
    label: 'Online Movement',
    description: 'Discussions coalesce into organised online campaigns across social media platforms.',
  },
  {
    year: 'Late 2025',
    label: 'Manifesto',
    description: 'Key demands and principles are formally articulated and shared publicly.',
  },
  {
    year: 'Early 2026',
    label: 'First Gatherings',
    description: 'Initial peaceful public gatherings take place in response to ongoing concerns.',
  },
  {
    year: 'Mid 2026',
    label: 'Nationwide Expansion',
    description: 'Demonstrations spread to multiple cities across India, growing in participation.',
  },
  {
    year: '20 July 2026',
    label: 'Major Protest',
    description: 'Coordinated peaceful protests in cities nationwide draw significant public attention.',
  },
  {
    year: 'Ongoing',
    label: 'Continued Action',
    description: 'The movement continues with ongoing demonstrations, discourse, and advocacy.',
  },
];

const SOURCES = [
  {
    title: 'The Guardian',
    description: "Who are India's Cockroach Janta party and why are they staging protests?",
    url: 'https://www.theguardian.com/world/2026/jul/20/who-are-indias-cockroach-janta-party-and-why-are-they-staging-protests-',
  },
  {
    title: 'CJP Official Website',
    description: "Official website of the Cockroach Janta Party — India's youth movement for transparency and reform.",
    url: 'https://www.cockrochjantaparty.co.in/',
  },
];

/**
 * The Movement page — explains why students are protesting, the movement's origins,
 * demands, timeline, and how the archive documents it.
 *
 * @returns {JSX.Element} Rendered movement page.
 */
export default function MovementPage(): JSX.Element {
  return (
    <div>
      {/* Hero */}
      <section className="border-b-2 border-black bg-black py-14 text-white">
        <Container>
          <div className="font-mono text-[10px] tracking-widest text-yellow-400 uppercase">/ Why Protest</div>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight uppercase md:text-6xl">
            Why students are protesting?
          </h1>
          <p className="mt-4 max-w-3xl text-white/80">
            Understanding the origins, demands, timeline, and purpose behind the student movement documented in this
            archive.
          </p>
        </Container>
      </section>

      {/* What Is This Movement? */}
      <section className="py-12">
        <Container>
          <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase md:text-4xl">
            What Is This Movement?
          </h2>
          <p className="mt-4">
            The movement documented in this archive began as a student-led response to concerns over the integrity of
            competitive examinations, repeated paper leak allegations, youth unemployment, and demands for greater
            institutional accountability. What started as online discussion gradually evolved into peaceful public
            demonstrations across multiple cities in India.
          </p>
          <p className="mt-3">
            Organised primarily under the banner of the Cockroach Janta Party (CJP), the movement describes itself as a
            youth-focused initiative centred on transparency, accountability, democratic participation, and reform
            advocacy — distinct from traditional electoral politics.
          </p>
        </Container>
      </section>

      {/* Why Did It Begin? */}
      <section className="border-y-2 border-black bg-gray-100 py-12">
        <Container>
          <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase md:text-4xl">
            Why Did It Begin?
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              'Concerns over competitive examination integrity',
              'Student frustration over repeated exam controversies',
              'Demands for institutional accountability',
              'Calls for educational reform and modernisation',
              'Amplification through social media and online organising',
              'Growing youth unemployment and economic anxiety',
            ].map((item) => (
              <div key={item} className="shadow-brutal-sm flex items-center gap-3 border-2 border-black bg-white p-3">
                <div className="h-2 w-2 shrink-0 rounded-full bg-yellow-400" />
                <span className="text-xs leading-tight font-bold uppercase">{item}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Timeline */}
      <section className="py-12">
        <Container>
          <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase md:text-4xl">Timeline</h2>
          <div className="relative mt-8 space-y-0">
            <div className="absolute top-3 left-4.25 h-[calc(100%-24px)] w-2 bg-black" />
            {TIMELINE_ITEMS.map((item, i) => (
              <div key={item.label} className="relative flex gap-5 pb-8 last:pb-0">
                <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center border-2 border-black bg-yellow-400">
                  <span className="font-display text-xs font-extrabold">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[10px] tracking-widest text-black/60 uppercase">{item.year}</span>
                    <span className="font-display text-base font-extrabold uppercase">{item.label}</span>
                  </div>
                  <p className="mt-0.5">{item.description}</p>
                  <Link
                    href="/videos"
                    className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] tracking-widest text-yellow-400 underline underline-offset-2 hover:text-black"
                  >
                    Browse related videos <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Core Demands */}
      <section className="border-y-2 border-black bg-gray-100 py-12">
        <Container>
          <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase md:text-4xl">Core Demands</h2>
          <p className="mt-2">
            The movement publicly advocates for the following principles, reflected in its published manifesto and
            official communications.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {DEMANDS.map((d) => (
              <div key={d.title} className={cn('shadow-brutal border-2 border-black p-5', d.color)}>
                <div className="flex items-center gap-2">
                  <div className="shadow-brutal-sm border-2 border-black bg-white p-1.5 text-black">{d.icon}</div>
                  <h3 className="font-display text-lg font-extrabold uppercase">{d.title}</h3>
                </div>
                <p className="mt-3">{d.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-black/50">
            Disclaimer: This demand data is gathered from public internet sources. Please check official movement
            communications for the most accurate and current information.
          </p>
        </Container>
      </section>

      {/* Where Did It Spread? */}
      <section className="py-12">
        <Container className="text-center">
          <Globe className="mx-auto h-10 w-10 text-black" />
          <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight uppercase md:text-4xl">
            Where Did It Spread?
          </h2>
          <p className="mt-3">
            Peaceful demonstrations have been documented in cities across India — from Delhi and Mumbai to smaller towns
            and university campuses. Our archive organises videos by state and city, making it possible to trace how the
            movement spread geographically.
          </p>
          <Link href="/categories">
            <Button variant="default" shadow className="mt-6">
              Browse by Location <ArrowRight className="size-4" />
            </Button>
          </Link>
        </Container>
      </section>

      {/* Why This Archive Exists */}
      <section className="border-y-2 border-black bg-yellow-400 py-12">
        <Container>
          <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase md:text-4xl">
            Why This Archive Exists
          </h2>
          <p className="mt-4">
            Public demonstrations generate thousands of videos across Instagram. While each recording captures only one
            perspective, together they form a visual record of the movement. Indian Students Protest Vault organises
            these publicly shared videos by event, city, date, and topic so they remain easy to discover and explore.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/videos">
              <Button variant="default" shadow>
                Explore the Archive <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="default-outline">
                Learn More <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Sources */}
      <section className="py-12">
        <Container>
          <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase md:text-4xl">Sources</h2>
          <p className="mt-2">Information on this page is drawn from the following publicly available sources.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {SOURCES.map((source) => (
              <a
                key={source.title}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shadow-brutal group block border-2 border-black bg-white p-4 transition-colors hover:bg-yellow-400"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-extrabold uppercase">{source.title}</h3>
                  <ExternalLink className="mt-0.5 size-4 shrink-0 text-black/40 transition-colors group-hover:text-black" />
                </div>
                <p className="mt-1">{source.description}</p>
              </a>
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-black/60">
            This page is for informational purposes. For the most current and detailed information, refer to the
            original source materials linked above.
          </p>
        </Container>
      </section>

      {/* Closing CTA */}
      <section className="bg-black py-12">
        <Container className="flex flex-col items-center gap-4 text-center">
          <blockquote className="font-display text-2xl leading-tight font-extrabold text-white uppercase italic">
            &ldquo;Every recording is a piece of the story.&rdquo;
          </blockquote>
          <Link href="/videos">
            <Button variant="light" shadow>
              Browse the Archive <ArrowRight className="size-4" />
            </Button>
          </Link>
        </Container>
      </section>
    </div>
  );
}
