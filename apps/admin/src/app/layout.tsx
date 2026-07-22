import type { JSX, ReactNode } from 'react';

import Link from 'next/link';

import { createServerSupabase } from '@/lib/supabase-server';

import './globals.css';
import { Providers } from './Providers';

/**
 * Root layout with authentication-aware navigation bar.
 *
 * @param {{ children: ReactNode }} props - Component properties.
 * @param {ReactNode} props.children - Page content to render.
 *
 * @returns {Promise<JSX.Element>} Rendered layout.
 */
export default async function RootLayout({ children }: { children: ReactNode }): Promise<JSX.Element> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 text-black antialiased">
        {user && (
          <nav className="border-b-2 border-black bg-white px-6 py-3">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div className="flex items-center gap-6">
                <span className="font-display text-sm font-extrabold uppercase">Reel Vault Admin</span>
                <Link href="/" className="text-xs font-bold uppercase hover:text-yellow-500">
                  Dashboard
                </Link>
                <a href="/videos" className="text-xs font-bold uppercase hover:text-yellow-500">
                  Videos
                </a>
                <a href="/categories" className="text-xs font-bold uppercase hover:text-yellow-500">
                  Categories
                </a>
                <a href="/locations" className="text-xs font-bold uppercase hover:text-yellow-500">
                  Locations
                </a>
              </div>
              <form action="/api/logout" method="post">
                <button className="text-xs font-bold uppercase hover:text-red-500">Logout</button>
              </form>
            </div>
          </nav>
        )}
        <main className="mx-auto max-w-7xl">
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
