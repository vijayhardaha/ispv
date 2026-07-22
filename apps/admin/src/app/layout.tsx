import type { JSX, ReactNode } from 'react';

import { JetBrains_Mono, Poppins, Space_Grotesk } from 'next/font/google';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { createServerSupabase } from '@/lib/supabase-server';

import './globals.css';
import { Providers } from './Providers';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

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
    <html lang="en" className={`${spaceGrotesk.variable} ${poppins.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body min-h-screen bg-gray-100 text-black antialiased">
        {user && (
          <header>
            <nav className="border-b-2 border-black bg-white py-3" aria-label="Main navigation">
              <Container className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <span className="font-display text-sm font-extrabold uppercase">Reel Vault Admin</span>
                  <Link href="/" className="text-xs font-bold uppercase hover:text-yellow-500">
                    Dashboard
                  </Link>
                  <Link href="/videos" className="text-xs font-bold uppercase hover:text-yellow-500">
                    Videos
                  </Link>
                  <Link href="/categories" className="text-xs font-bold uppercase hover:text-yellow-500">
                    Categories
                  </Link>
                  <Link href="/locations" className="text-xs font-bold uppercase hover:text-yellow-500">
                    Locations
                  </Link>
                </div>
                <form action="/api/logout" method="post">
                  <Button type="submit" variant="ghost" size="sm">
                    Logout
                  </Button>
                </form>
              </Container>
            </nav>
          </header>
        )}
        <main className="py-8">
          <Container>
            <Providers>{children}</Providers>
          </Container>
        </main>
      </body>
    </html>
  );
}
