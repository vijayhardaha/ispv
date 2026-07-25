'use client';

import type { JSX } from 'react';

import { Container } from '@/components/ui/Container';

/**
 * FAQ entry shape with question and answer.
 *
 * @type {FAQItem}
 * @property {string} question - The question text.
 * @property {string} answer - The answer text (HTML-safe plain text).
 */
interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Predefined FAQ entries covering the archive's purpose, video sources,
 * categorisation, submissions, affiliations, content rights, takedowns,
 * contributions, and update frequency.
 */
const FAQS: FAQItem[] = [
  {
    question: 'What is the Indian Students Protest Vault?',
    answer:
      'A non-partisan digital archive preserving publicly shared Instagram reels from student protests across India. It serves as a searchable, timestamped record of protests, rallies, and related events — organised by category, city, and location to support journalism, research, and public awareness.',
  },
  {
    question: 'Where do the videos come from?',
    answer:
      'All videos are publicly shared on Instagram (posts, reels, or reels). We index them through crowd-sourced submissions and manual curation. We do not host any video files — embeds point directly to Instagram.',
  },
  {
    question: 'How are videos categorised?',
    answer:
      'Each video is tagged with a category (e.g. Protest Marches, Police Conduct, Human Rights, Acts of Kindness), a city and state location, and optional descriptive tags. This makes it easy to filter and explore by theme or geography.',
  },
  {
    question: 'Can I submit a video?',
    answer:
      'Yes. Use the Submit Video button on the homepage. Paste an Instagram URL, select a category and location, and optionally add a description and tags. Our team reviews submissions before they appear in the archive.',
  },
  {
    question: 'Is this site affiliated with any political party or government?',
    answer:
      'No. Indian Students Protest Vault is an independent, non-partisan project. It is not affiliated with Instagram/Meta, the Government of India, any political party, or any activist organisation.',
  },
  {
    question: 'Can I download or reuse the videos?',
    answer:
      'All videos remain the property of their original creators. We do not host or redistribute media files. Please contact the original creator on Instagram for reuse requests. The archive metadata and search functionality are open for educational and journalistic use.',
  },
  {
    question: 'How can I request removal of a video?',
    answer:
      'DM @vegan.vijay on Instagram with the Instagram URL and reason for removal. If you are the original video owner, please mention that and provide a valid reason. We prioritise removal requests from video owners and review all requests within 48 hours. You can reach us directly at https://www.instagram.com/vegan.vijay/.',
  },
  {
    question: 'Can I contribute to the project as a developer or curator?',
    answer:
      'This project is not open source at the moment. However, if you are a developer or curator and are interested in contributing, reach out to the author on Instagram at https://www.instagram.com/vegan.vijay/. Please mention why you are contacting in your first message so we can understand how you would like to help.',
  },
  {
    question: 'How often is the archive updated?',
    answer:
      'Once you submit a video, the author reviews it to check if it is related to the protests. The author then fixes any details if needed — such as adding extra tags, correcting the description, or updating location information — and publishes the video. Typically, videos are published within 1-2 hours of submission.',
  },
];

/**
 * Plus icon SVG for closed accordion state.
 *
 * @returns {JSX.Element} Plus SVG icon.
 */
function PlusIcon(): JSX.Element {
  return (
    <svg className="icon-plus size-8 md:size-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M12 4v16m8-8H4" />
    </svg>
  );
}

/**
 * Minus icon SVG for open accordion state.
 *
 * @returns {JSX.Element} Minus SVG icon.
 */
function MinusIcon(): JSX.Element {
  return (
    <svg className="icon-minus size-8 md:size-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M20 12H4" />
    </svg>
  );
}

/**
 * FAQ section with brutalist card-style accordion using native details/summary.
 * Matches the heavy shadow, thick border, and hover-lift aesthetic.
 *
 * @returns {JSX.Element} Rendered FAQ section.
 */
export function FAQSection(): JSX.Element {
  return (
    <section className="relative w-full overflow-hidden bg-gray-200 py-12 selection:bg-yellow-400 selection:text-black md:py-16">
      <style>{`
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
        details[open] .icon-plus { display: none; }
        details:not([open]) .icon-minus { display: none; }
        details[open] summary ~ * { animation: faqSweep 0.3s ease-in-out; }
        @keyframes faqSweep {
          0%   { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Container>
        <div className="mx-auto max-w-250">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mb-6 inline-block -rotate-2 border-2 border-black bg-yellow-400 px-4 py-2 shadow-[4px_4px_0px_0px_#000]">
              <h2 className="font-mono text-sm font-bold tracking-tight uppercase md:text-base">{'//'} The FAQs</h2>
            </div>
            <h2 className="font-display text-5xl leading-[0.9] font-black tracking-tighter uppercase md:text-7xl">
              Everything you
              <br />
              <span className="underline decoration-yellow-400 decoration-[6px] underline-offset-4">need to know</span>
            </h2>
          </div>

          {/* FAQ Cards */}
          <div className="flex flex-col gap-6">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group shadow-brutal-xl hover:shadow-brutal-2xl open:shadow-brutal border-2 border-black bg-white transition-[transform,box-shadow] duration-200 open:translate-x-0.5 open:translate-y-0.5 hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <summary className="flex cursor-pointer items-center justify-between p-6 select-none md:p-8">
                  <h3 className="font-display text-xl font-bold tracking-tight uppercase md:text-3xl">
                    {faq.question}
                  </h3>
                  <div className="ml-4 shrink-0">
                    <PlusIcon />
                    <MinusIcon />
                  </div>
                </summary>
                <div className="border-t-2 border-black bg-yellow-400/10 p-6 md:p-8">
                  <p className="font-mono text-base leading-relaxed md:text-lg">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="mb-4 font-mono text-sm tracking-widest uppercase">Still got questions?</p>
            <a
              href="https://www.instagram.com/vegan.vijay/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border-2 border-black bg-black px-8 py-4 text-xl font-bold text-white uppercase shadow-[4px_4px_0px_0px_#fdc700] transition-[colors,box-shadow] duration-200 hover:bg-yellow-400 hover:text-black hover:shadow-[4px_4px_0px_0px_#000]"
            >
              Message @vegan.vijay
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
