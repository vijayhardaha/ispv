import type { JSX, ReactNode } from 'react';

import type { Metadata } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono, Poppins } from 'next/font/google';

import { AdminFooter } from '@/components/layout/AdminFooter';
import { AdminMain } from '@/components/layout/AdminMain';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { SkipContent } from '@/components/layout/SkipContent';
import { SITE_METADATA } from '@/constants/seo';
import { createServerSupabase } from '@/lib/db/supabase-server';

import './globals.css';

const bodyFont = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

const headingFont = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const monoFont = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

/**
 * Site-wide metadata for the admin panel using SEO configuration.
 */
export const metadata: Metadata = SITE_METADATA;

/**
 * Root layout with a left sidebar and right body column when authenticated.
 *
 * The sidebar (logo, menus, logout) sits fixed on the left; pages render in
 * the right column between the main content and the footer. Unauthenticated
 * visitors (login) get the full-width body without the sidebar.
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
    <html lang="en" className={`${bodyFont.variable} ${headingFont.variable} ${monoFont.variable}`}>
      <body className="font-body min-h-screen bg-gray-100 text-black antialiased">
        <SkipContent />
        {user ? (
          <div className="flex min-h-screen">
            <AdminSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <AdminMain>{children}</AdminMain>
              <AdminFooter />
            </div>
          </div>
        ) : (
          <AdminMain>{children}</AdminMain>
        )}
      </body>
    </html>
  );
}
