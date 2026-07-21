'use client';

import { useState, type JSX } from 'react';

import { Menu, X, Flag } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Chakra } from '@/components/flags/FlagStripe';
import { SubmitVideoDialog } from '@/components/submit/SubmitVideoDialog';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/categories', label: 'Categories' },
  { href: '/videos', label: 'All Videos' },
  { href: '/about', label: 'About' },
];

/**
 * Site-wide sticky header with navigation, branding, and mobile menu.
 *
 * @returns {JSX.Element} Rendered header with flag stripe and nav links.
 */
export function Header(): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));
  return (
    <header className="sticky top-0 z-40">
      <div className="border-b-[3px] border-black bg-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link href="/" className="group flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <div className="shadow-brutal-sm relative flex h-12 w-12 items-center justify-center border-[3px] border-black bg-orange-500 transition-transform group-hover:-rotate-6">
              <Flag className="h-6 w-6 text-[#0a0a0c]" strokeWidth={2.5} />
              <Chakra className="absolute -right-1 -bottom-1 h-5 w-5 text-[#0a0a0c]" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-extrabold tracking-tight uppercase md:text-xl">
                Protest Vault
              </div>
              <div className="font-mono text-[10px] tracking-widest text-black/60 uppercase">
                Voices · Streets · Reels
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-display border-[3px] border-black px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-all',
                  isActive(link.href)
                    ? 'shadow-brutal-sm -translate-y-px bg-orange-500'
                    : 'bg-white hover:bg-orange-500'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <SubmitVideoDialog trigger={<Button variant="primary">Submit Video</Button>} />
          </div>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="shadow-brutal-sm border-[3px] border-black bg-white p-2 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t-[3px] border-black bg-gray-100 md:hidden">
            <div className="space-y-2 px-4 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'font-display block border-[3px] border-black px-3 py-2 text-sm font-bold tracking-wider uppercase',
                    isActive(link.href) ? 'shadow-brutal-sm bg-orange-500' : 'bg-white'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <SubmitVideoDialog
                trigger={
                  <Button variant="primary" className="w-full">
                    Submit Video
                  </Button>
                }
                onOpenChange={(o) => !o && setMobileOpen(false)}
              />
            </div>
            <div className="border-t-[3px] border-black bg-white px-4 py-2 font-mono text-[10px] tracking-widest text-black/60 uppercase">
              Current: {pathname}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
