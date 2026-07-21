import { Heart, ShieldAlert, GitCommitHorizontal, Mail, BookOpen } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react/jsx-runtime';

import { Chakra } from '@/components/flags/FlagStripe';

/**
 * Site-wide footer with branding, links, resources, and disclaimer.
 *
 * @returns {JSX.Element} Rendered footer with flag stripe and multi-column layout.
 */
export function Footer(): JSX.Element {
  return (
    <footer className="mt-20 border-t-[3px] border-black">
      <div className="bg-black text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-orange-600">
              <Chakra className="h-7 w-7" />
              <span className="font-display text-xl font-extrabold tracking-tight uppercase">Protest Vault</span>
            </div>
            <p className="mt-3 text-sm text-white/80">
              A peaceful archive of India&apos;s protest movement. Reels, marches, candlelight vigils, art on the walls
              — collected, indexed, and kept open.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 border-2 border-black bg-orange-500 px-2.5 py-0.5 font-mono text-xs font-bold text-black uppercase">
                #PeacefulProtest
              </span>
              <span className="inline-flex items-center gap-1 border-2 border-black bg-white px-2.5 py-0.5 font-mono text-xs font-bold text-black uppercase">
                #India
              </span>
              <span className="inline-flex items-center gap-1 border-2 border-black bg-blue-600 px-2.5 py-0.5 font-mono text-xs font-bold text-white uppercase">
                #OpenArchive
              </span>
            </div>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-display text-sm font-extrabold tracking-wider text-orange-600 uppercase">Info</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link className="hover:text-orange-600" href="/about">
                  About the project
                </Link>
              </li>
              <li>
                <Link className="hover:text-orange-600" href="/categories">
                  Browse categories
                </Link>
              </li>
              <li>
                <Link className="hover:text-orange-600" href="/videos">
                  All videos
                </Link>
              </li>
              <li>
                <a className="hover:text-orange-600" href="/about#how-it-works">
                  How submissions work
                </a>
              </li>
            </ul>
          </div>

          {/* Useful links */}
          <div>
            <h4 className="font-display text-sm font-extrabold tracking-wider text-orange-600 uppercase">
              Useful Links
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a className="hover:text-orange-600" href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                  Instagram (open)
                </a>
              </li>
              <li>
                <a
                  className="hover:text-orange-600"
                  href="https://www.bbc.com/news/world/asia/india"
                  target="_blank"
                  rel="noreferrer"
                >
                  BBC India coverage
                </a>
              </li>
              <li>
                <a className="hover:text-orange-600" href="https://indianexpress.com/" target="_blank" rel="noreferrer">
                  Indian Express
                </a>
              </li>
              <li>
                <a className="hover:text-orange-600" href="https://thewire.in/" target="_blank" rel="noreferrer">
                  The Wire
                </a>
              </li>
              <li>
                <a className="hover:text-orange-600" href="https://scroll.in/" target="_blank" rel="noreferrer">
                  Scroll.in
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display text-sm font-extrabold tracking-wider text-orange-600 uppercase">Resources</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-4 w-4 text-orange-600" />
                <a
                  className="hover:text-orange-600"
                  href="https://knowindia.india.gov.in/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Know India — Government of India
                </a>
              </li>
              <li className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-4 w-4 text-orange-600" />
                <a
                  className="hover:text-orange-600"
                  href="https://en.wikipedia.org/wiki/Freedom_of_speech_in_India"
                  target="_blank"
                  rel="noreferrer"
                >
                  Freedom of speech in India
                </a>
              </li>
              <li className="flex items-start gap-2">
                <GitCommitHorizontal className="mt-0.5 h-4 w-4 text-orange-600" />
                <a className="hover:text-orange-600" href="https://github.com/" target="_blank" rel="noreferrer">
                  Source on GitHub
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 text-orange-600" />
                <a className="hover:text-orange-600" href="mailto:hi@protest.vault">
                  hi@protest.vault
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t-[3px] border-white/20 bg-black px-4 py-6 md:px-6">
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-6">
            <div className="flex items-start gap-2 text-sm text-white/80">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-orange-600" />
              <p className="max-w-3xl">
                <span className="font-bold text-orange-600 uppercase">Disclaimer:</span> Protest Vault is an
                independent, non-partisan archive of publicly-shared Instagram reels. It is not affiliated with
                Instagram/Meta, the Government of India, or any political party. All clips remain the property of their
                original creators. If you believe a video should be removed, email
                <a className="ml-1 underline hover:text-orange-600" href="mailto:hi@protest.vault">
                  hi@protest.vault
                </a>{' '}
                and we will review it within 48 hours. We do not host any media files — embeds point back to Instagram.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs tracking-widest text-white/60 uppercase">
              <span>Made with</span>
              <Heart className="h-4 w-4 fill-orange-600 text-orange-600" />
              <span>in India</span>
            </div>
          </div>
        </div>

        <div className="border-t-4 border-white">
          <div className="mx-auto flex max-w-7xl flex-col md:flex-row justify-between items-center gap-6 px-4 py-8 md:px-6">
            <p className="font-bold uppercase tracking-wider text-sm">© 2024 Shelter Structure. All rights reserved.</p>
            <div className="flex space-x-8">
              <a className="font-bold uppercase tracking-wider text-sm hover:text-orange-500 transition-colors" href="#" target="_self">
                Privacy
              </a>
              <a className="font-bold uppercase tracking-wider text-sm hover:text-orange-500 transition-colors" href="#" target="_self">
                Terms
              </a>
              <a className="font-bold uppercase tracking-wider text-sm hover:text-orange-500 transition-colors" href="#" target="_self">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
