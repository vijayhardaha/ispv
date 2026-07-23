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
 * Chronological timeline of key protest events.
 */
export const TIMELINE_ITEMS: TimelineItem[] = [
  {
    year: '2025',
    label: 'Peaceful Protests Begin',
    description:
      'Students across multiple universities begin peaceful demonstrations, raising concerns about campus safety, administrative transparency, and student rights.',
  },
  {
    year: '2025',
    label: 'Widespread Awareness',
    description:
      "Social media campaigns and on-ground efforts bring national and international attention to the students' demands. Peaceful marches are organised in major cities.",
  },
  {
    year: '2025',
    label: 'Community Solidarity',
    description:
      'Faculty members, civil society groups, and public figures express solidarity. Open letters and public statements amplify calls for dialogue and resolution.',
  },
  {
    year: '2025',
    label: 'Policy Discussions',
    description:
      'Administrative bodies initiate discussions on key demands. Student representatives participate in formal dialogues while continuing peaceful advocacy.',
  },
  {
    year: '2025',
    label: 'Ongoing Movement',
    description:
      'The movement continues to evolve with sustained civic engagement, public discourse, and efforts toward institutional reform.',
  },
];

/**
 * External sources referenced by the protest information page.
 */
export const SOURCES: Source[] = [
  {
    title: 'News Media Coverage',
    url: 'https://en.wikipedia.org/wiki/2024%E2%80%9325_Indian_protests_against_the_Controversies_and_roadblocks',
    description:
      'Major national and international news outlets providing verified reports on protest events and student statements.',
  },
  {
    title: 'Student Organisations',
    url: 'https://en.wikipedia.org/wiki/2024%E2%80%9325_Indian_protests_against_the_Controversies_and_roadblocks',
    description: 'Official communications and manifestos published by student bodies and protest organisers.',
  },
  {
    title: 'Public Records',
    url: 'https://en.wikipedia.org/wiki/2024%E2%80%9325_Indian_protests_against_the_Controversies_and_roadblocks',
    description: 'Government and institutional statements, reports, and official responses related to the protests.',
  },
  {
    title: 'Civil Society Reports',
    url: 'https://en.wikipedia.org/wiki/2024%E2%80%9325_Indian_protests_against_the_Controversies_and_roadblocks',
    description:
      'Reports and analyses from human rights organisations and civil society groups documenting the movement.',
  },
];
