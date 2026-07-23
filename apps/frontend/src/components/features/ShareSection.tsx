'use client';

import { useState } from 'react';
import type { ComponentType, JSX } from 'react';

import { Check, Copy } from 'lucide-react';
import { FaFacebook, FaInstagram, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/cn';

const SHARE_MESSAGE = `🇮🇳 Discover the Indian Students Protest Vault — a searchable archive of publicly shared protest videos from across India.

Browse by city, category, or hashtag. Preserving history, one reel at a time. 🕊️

https://ispv.vercel.app`;

const SHARE_URL = 'https://ispv.vercel.app';

const SHARE_TEXT = `🇮🇳 Discover the Indian Students Protest Vault — a searchable archive of publicly shared protest videos from across India. Browse by city, category, or hashtag. 🕊️`;

/**
 * Share button configuration with platform name, icon, color, and share URL generator.
 *
 * @type {SharePlatform}
 * @property {string} name - Display name.
 * @property {object} icon - Icon component accepting className prop.
 * @property {string} hoverBg - Tailwind hover background class.
 * @property {string} bg - Tailwind background class.
 * @property {(message: string, url: string) => string} getShareUrl - Generates share URL.
 */
interface SharePlatform {
  name: string;
  icon: ComponentType<{ className?: string }>;
  hoverBg: string;
  bg: string;
  getShareUrl: (message: string, url: string) => string;
}

const PLATFORMS: SharePlatform[] = [
  {
    name: 'WhatsApp',
    icon: FaWhatsapp,
    bg: 'bg-green-600',
    hoverBg: 'hover:bg-green-700',
    getShareUrl: (message, url) => `https://wa.me/?text=${encodeURIComponent(`${message}\n\n${url}`)}`,
  },
  {
    name: 'Facebook',
    icon: FaFacebook,
    bg: 'bg-blue-600',
    hoverBg: 'hover:bg-blue-700',
    getShareUrl: (message, url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`,
  },
  {
    name: 'X (Twitter)',
    icon: FaXTwitter,
    bg: 'bg-black',
    hoverBg: 'hover:bg-zinc-800',
    getShareUrl: (message, url) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${message}\n\n${url}`)}`,
  },
  {
    name: 'Instagram',
    icon: FaInstagram,
    bg: 'bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400',
    hoverBg: 'hover:from-purple-700 hover:via-pink-600 hover:to-orange-500',
    getShareUrl: () => '',
  },
];

/**
 * Share section with a pitch message and social media buttons for spreading the word.
 * Placed after the SloganTicker on the homepage.
 *
 * @returns {JSX.Element} Rendered share section.
 */
export function ShareSection(): JSX.Element {
  const [copied, setCopied] = useState(false);
  const [igCopied, setIgCopied] = useState(false);

  const copyMessage = (setter: (v: boolean) => void): void => {
    navigator.clipboard.writeText(SHARE_MESSAGE).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2000);
    });
  };

  return (
    <section className="border-y-2 border-black bg-gray-100 py-12 md:py-16">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          {/* Tag */}
          <div className="mb-6 inline-block -rotate-2 border-2 border-black bg-yellow-400 px-4 py-2 shadow-[4px_4px_0px_0px_#000]">
            <span className="font-mono text-sm font-bold tracking-tight uppercase">Spread the word</span>
          </div>

          {/* Heading */}
          <h2 className="font-display text-4xl leading-[0.9] font-black tracking-tighter uppercase md:text-5xl">
            Help us preserve
            <br />
            <span className="underline decoration-yellow-400 decoration-[6px] underline-offset-4">public memory</span>
          </h2>

          {/* Pitch */}
          <p className="mx-auto mt-6 max-w-2xl font-mono text-sm leading-relaxed text-zinc-700 md:text-base">
            Indian Students Protest Vault is a free, non-partisan archive indexing publicly shared Instagram reels from
            student protests across India. Every video is organised by city, category, and hashtag — making it easy to
            search, explore, and understand. Share this project with someone who needs to see it.
          </p>

          {/* Share buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {PLATFORMS.map((platform) => {
              const Icon = platform.icon;

              if (platform.name === 'Instagram') {
                return (
                  <button
                    key={platform.name}
                    onClick={() => copyMessage(setIgCopied)}
                    className={cn(
                      'shadow-brutal hover:shadow-brutal-lg inline-flex items-center gap-2 border-2 border-black px-5 py-3 text-sm font-bold text-white uppercase transition-transform duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5',
                      platform.bg,
                      platform.hoverBg
                    )}
                  >
                    {igCopied ? <Check className="size-4" /> : <Icon className="size-4" />}
                    {igCopied ? 'Copied!' : platform.name}
                  </button>
                );
              }

              const shareUrl = platform.getShareUrl(SHARE_TEXT, SHARE_URL);
              return (
                <a
                  key={platform.name}
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'shadow-brutal hover:shadow-brutal-lg inline-flex items-center gap-2 border-2 border-black px-5 py-3 text-sm font-bold text-white uppercase transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5',
                    platform.bg,
                    platform.hoverBg
                  )}
                >
                  <Icon className="size-4" />
                  {platform.name}
                </a>
              );
            })}
          </div>

          {/* Divider with text */}
          <div className="mt-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-black" />
            <span className="shrink-0 font-mono text-[11px] font-bold tracking-[0.15em] text-black uppercase">
              Or copy the message to share anywhere
            </span>
            <div className="h-px flex-1 bg-black" />
          </div>

          {/* Message preview + copy button */}
          <div className="mt-6 space-y-6">
            <div className="border-2 border-dashed border-zinc-300 bg-gray-50 p-4 text-left font-medium text-zinc-700">
              {SHARE_MESSAGE.split('\n').map((line, i) => (
                <p key={i}>{line || '\u00A0'}</p>
              ))}
            </div>
            <Button onClick={() => copyMessage(setCopied)} variant="default" size="lg" shadow>
              {copied ? (
                <>
                  <Check className="size-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" /> Copy & Share
                </>
              )}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
