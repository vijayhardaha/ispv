import type { JSX, ReactNode } from "react";

import { createServerSupabase } from "@/lib/supabase";
import { Providers } from "./Providers";
import "./globals.css";

export default async function RootLayout({ children }: { children: ReactNode }): Promise<JSX.Element> {
  const supabase = await createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 text-black antialiased">
        {user && (
          <nav className="border-b-2 border-black bg-white px-6 py-3">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div className="flex items-center gap-6">
                <span className="font-display text-sm font-extrabold uppercase">Reel Vault Admin</span>
                <a href="/" className="text-xs font-bold uppercase hover:text-yellow-500">
                  Dashboard
                </a>
                <a href="/videos" className="text-xs font-bold uppercase hover:text-yellow-500">
                  Videos
                </a>
                <a href="/categories" className="text-xs font-bold uppercase hover:text-yellow-500">
                  Categories
                </a>
                <a href="/states" className="text-xs font-bold uppercase hover:text-yellow-500">
                  States
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
