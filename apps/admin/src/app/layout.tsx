import type { JSX, ReactNode } from 'react';

import type { Metadata } from 'next';
import { JetBrains_Mono, Poppins, Space_Grotesk } from 'next/font/google';

import { AdminFooter } from '@/components/layout/AdminFooter';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { AdminMain } from '@/components/layout/AdminMain';
import { SkipContent } from '@/components/layout/SkipContent';
import { SITE_METADATA } from '@/constants/seo';
import { createServerSupabase } from '@/lib/supabase-server';

import './globals.css';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

/**
 * Site-wide metadata for the admin panel using SEO configuration.
 */
export const metadata: Metadata = SITE_METADATA;

/**
 * Root layout with authentication-aware navigation bar using shared NAV_LINKS constant.
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
      <body className="font-body flex min-h-screen flex-col bg-gray-100 text-black antialiased">
        <SkipContent />
        {user && <AdminHeader />}
        <AdminMain>{children}</AdminMain>
        <AdminFooter />
      </body>
    </html>
  );
}
