'use client';

import { useState, type JSX } from 'react';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SubmitVideoDialog } from '@/components/features/SubmitVideoDialog';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/cn';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/videos', label: 'All Videos' },
  { href: '/why-students-are-protesting', label: 'Why Protest' },
  { href: '/categories', label: 'Categories' },
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
      <div className="border-b-2 border-black bg-gray-100">
        <Container className="flex items-center justify-between gap-3 py-3">
          <Link href="/" className="group flex items-center" onClick={() => setMobileOpen(false)}>
            <div className="flex flex-col gap-1 leading-tight">
              <div className="font-display text-lg font-extrabold tracking-tight uppercase md:text-xl">
                Indian Students Protest Vault
              </div>
              <div className="font-mono text-xs tracking-widest text-black/60 uppercase">
                Students · Cameras · Change
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <nav className="flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'font-display text-sm font-semibold tracking-wider uppercase underline-offset-4 transition-colors hover:underline',
                    isActive(link.href) ? 'text-yellow-400 underline' : 'text-black hover:text-yellow-400'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <SubmitVideoDialog
              trigger={
                <Button variant="default" size="sm">
                  Submit Video
                </Button>
              }
            />
          </div>

          <Button
            variant="default"
            className="p-2 md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </Container>

        {mobileOpen && (
          <div className="border-t-2 border-black bg-gray-100 md:hidden">
            <div className="space-y-2 px-4 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'font-display block text-base font-bold tracking-wider uppercase underline-offset-4 transition-colors hover:underline',
                    isActive(link.href) ? 'text-yellow-400 underline' : 'text-black hover:text-yellow-400'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <SubmitVideoDialog
                trigger={
                  <Button variant="default" className="w-full">
                    Submit Video
                  </Button>
                }
                onOpenChange={(o) => !o && setMobileOpen(false)}
              />
            </div>
            <div className="border-t-2 border-black bg-white px-4 py-2 font-mono text-[10px] tracking-widest text-black/60 uppercase">
              Current: {pathname}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
