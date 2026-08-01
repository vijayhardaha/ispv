import type { JSX } from 'react';

import { breadcrumbSchema, webPageSchema } from '@vijayhardaha/schema-builder';
import { JsonLd } from '@vijayhardaha/schema-builder/react';
import { FileText, Gavel, Heart, Scale, Shield, Users } from 'lucide-react';
import type { Metadata } from 'next';

import { ClosingCtaSection } from '@/app/why-students-are-protesting/sections/ClosingCtaSection';
import { CoreDemandsSection } from '@/app/why-students-are-protesting/sections/CoreDemandsSection';
import { MovementHero } from '@/app/why-students-are-protesting/sections/MovementHero';
import { SourcesSection } from '@/app/why-students-are-protesting/sections/SourcesSection';
import { WhatIsSection } from '@/app/why-students-are-protesting/sections/WhatIsSection';
import { WhereSpreadSection } from '@/app/why-students-are-protesting/sections/WhereSpreadSection';
import { WhyDidBeginSection } from '@/app/why-students-are-protesting/sections/WhyDidBeginSection';
import { WhyThisArchiveExistsSection } from '@/app/why-students-are-protesting/sections/WhyThisArchiveExistsSection';
import { buildMetadata, buildBreadcrumbs, globalSchema, siteUrl } from '@/lib/seo';

/**
 * A single protest demand with its display styling and description.
 */
interface Demand {
  title: string;
  color: string;
  icon: JSX.Element;
  body: string;
}

/**
 * A referenced source with title, URL, and description.
 */
interface Source {
  title: string;
  url: string;
  description: string;
}

/**
 * Core demands of the student protest movement.
 */
const DEMANDS: Demand[] = [
  {
    title: 'Justice',
    color: 'bg-green-200',
    icon: <Scale />,
    body: 'Demand for fair and impartial investigation into all incidents of violence and justice for victims.',
  },
  {
    title: 'Safety',
    color: 'bg-blue-200',
    icon: <Shield />,
    body: 'Guarantee of safe campus environments and protection for all students regardless of background or belief.',
  },
  {
    title: 'Accountability',
    color: 'bg-yellow-200',
    icon: <Gavel />,
    body: 'Holding authorities and institutions accountable for their actions during protests and administrative decisions.',
  },
  {
    title: 'Dialogue',
    color: 'bg-orange-200',
    icon: <Users />,
    body: 'Establishing open channels of communication between students, faculty, and administration.',
  },
  {
    title: 'Rights',
    color: 'bg-red-200',
    icon: <Heart />,
    body: 'Protection of constitutional rights including freedom of speech, expression, and peaceful assembly.',
  },
  {
    title: 'Transparency',
    color: 'bg-purple-200',
    icon: <FileText />,
    body: 'Clear and transparent communication from institutions regarding policy changes and disciplinary actions.',
  },
];

/**
 * Referenced news and media sources covering the student protest movement.
 */
const SOURCES: Source[] = [
  {
    title: 'Cockroach Janta Party (Official)',
    url: 'https://www.cockrochjantaparty.co.in/',
    description:
      "Official website containing the movement's announcements, manifesto, campaign updates, and public communications.",
  },
  {
    title: 'The Hindu',
    url: 'https://www.thehindu.com/',
    description:
      'Independent reporting, ground coverage, interviews, and analysis related to student protests and public movements.',
  },
  {
    title: 'The Indian Express',
    url: 'https://indianexpress.com/',
    description:
      'Verified news reports, timelines, interviews, and investigative coverage documenting protest events across India.',
  },
  {
    title: 'NDTV',
    url: 'https://www.ndtv.com/',
    description:
      'National news coverage, live updates, interviews, and reports covering student protests and related developments.',
  },
  {
    title: 'Aaj Tak',
    url: 'https://www.aajtak.in/',
    description:
      'Hindi news coverage featuring reports, discussions, interviews, and on-ground updates from protest events.',
  },
  {
    title: 'Dainik Bhaskar',
    url: 'https://www.bhaskar.com/',
    description:
      'Regional and national reporting with city-wise coverage, eyewitness accounts, and protest related news updates.',
  },
  {
    title: 'NewsLaundry',
    url: 'https://www.newslaundry.com/',
    description:
      'Independent journalism featuring field reports, media analysis, interviews, and investigative stories related to public movements.',
  },
  {
    title: 'The Quint',
    url: 'https://www.thequint.com/',
    description:
      'Digital journalism platform covering public issues, ground reports, fact checks, and multimedia stories.',
  },
];

// ── Why Students Are Protesting page config ───────────────────────────────

/** Site URL used in JSON-LD schemas. */
const ROOT_URL = siteUrl();

const PAGE_TITLE = 'Why Students Are Protesting — Understanding the Movement';
const PAGE_DESCRIPTION =
  'Understand why Indian students are protesting — the origins, demands, timeline, and purpose behind the student movement documented in the Indian Students Protest Vault archive.';
const PAGE_PATH = '/why-students-are-protesting';

/** JSON-LD schemas for the movement overview page. */
const PAGE_SCHEMA = [
  ...globalSchema(),
  webPageSchema(
    { rootUrl: ROOT_URL, path: PAGE_PATH, breadcrumb: true },
    { name: PAGE_TITLE, description: PAGE_DESCRIPTION }
  ),
  breadcrumbSchema({ rootUrl: ROOT_URL, items: buildBreadcrumbs(PAGE_PATH, 'Why Students Are Protesting') }),
];

// ── Page metadata ──────────────────────────────────────────────────────────

/** SEO metadata for the movement overview page, rendered server-side via next/js. */
export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: PAGE_PATH,
  postfix: true,
});

/**
 * The Movement page — explains why students are protesting, the movement's origins,
 * demands, timeline, and how the archive documents it.
 *
 * @returns {JSX.Element} Rendered movement page.
 */
export default function MovementPage(): JSX.Element {
  return (
    <div>
      <JsonLd data={PAGE_SCHEMA} />
      <MovementHero />
      <WhatIsSection />
      <WhyDidBeginSection />
      <CoreDemandsSection demands={DEMANDS} />
      <WhereSpreadSection />
      <WhyThisArchiveExistsSection />
      <SourcesSection sources={SOURCES} />
      <ClosingCtaSection />
    </div>
  );
}
