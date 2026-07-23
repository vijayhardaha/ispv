import type { JSX } from 'react';

import { FileText, Gavel, Heart, Scale, Shield, Users } from 'lucide-react';

/**
 * A single protest demand with its display styling and description.
 */
export interface Demand {
  title: string;
  color: string;
  icon: JSX.Element;
  body: string;
}

/**
 * A single entry in the protest timeline.
 */
export interface TimelineItem {
  year: string;
  label: string;
  description: string;
}

/**
 * A referenced source with title, URL, and description.
 */
export interface Source {
  title: string;
  url: string;
  description: string;
}

/**
 * Core demands of the student protest movement.
 */
export const DEMANDS: Demand[] = [
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
 * Used in the Sources section of the Why Students Are Protesting page.
 */
export const SOURCES: Source[] = [
  {
    title: 'Cockroach Janta Party (Official)',
    url: 'https://www.cockrochjantaparty.co.in/',
    description:
      'Official website containing the movement’s announcements, manifesto, campaign updates, and public communications.',
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
