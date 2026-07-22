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

          <div className="hidden items-center gap-4 lg:flex">
            <nav className="flex items-center gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'font-display px-4 py-2 text-sm font-semibold tracking-tight uppercase underline-offset-4 transition-colors',
                    isActive(link.href) ? 'border-black bg-yellow-400' : 'text-black hover:text-yellow-400'
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

          <div className="flex items-center gap-2 lg:hidden">
            <Button variant="default" size="icon" aria-label="Toggle menu" onClick={() => setMobileOpen((o) => !o)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </Container>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="fixed top-0 right-0 flex h-full w-105 max-w-full flex-col border-l-2 border-black bg-gray-100 shadow-xl transition-transform duration-300">
              <div className="flex items-center justify-between border-b-2 border-black px-4 py-3">
                <span className="font-display text-sm font-extrabold uppercase">Menu</span>
                <Button variant="default" size="icon" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'font-display block border-2 border-transparent px-4 py-3 text-base font-bold tracking-tight uppercase transition-colors hover:border-black hover:bg-yellow-400',
                      isActive(link.href) ? 'border-black bg-yellow-400' : 'text-black'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="border-t-2 border-black bg-white p-4">
                <SubmitVideoDialog
                  trigger={
                    <Button variant="default" className="w-full">
                      Submit Video
                    </Button>
                  }
                  onOpenChange={(o) => !o && setMobileOpen(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
