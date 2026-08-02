'use client';

import type { JSX } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LogoutButton } from '@/components/LogoutButton';
import { SIDEBAR_NAV_LINKS } from '@/constants/navlinks';
import { cn } from '@/lib/utils';

/**
 * Admin panel sidebar with logo, navigation menus, and logout at the bottom.
 *
 * Rendered as a fixed-width column on the left. The logo links home, the
 * nav menus highlight the active route, and a divider-pinned logout button
 * sits at the bottom of the sidebar.
 *
 * @returns {JSX.Element} Rendered sidebar element.
 */
export function AdminSidebar(): JSX.Element {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-[#303641]">
      <Link href="/" className="border-b border-white/10 px-6 py-6" aria-label="ISPV Admin home">
        <span className="font-display text-2xl font-extrabold tracking-tight text-white uppercase">ISPV Admin</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Main navigation">
        {SIDEBAR_NAV_LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-semibold transition-colors',
                active ? 'bg-pink-600 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 p-4">
        <LogoutButton className="w-full" />
      </div>
    </aside>
  );
}
