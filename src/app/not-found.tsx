import Link from 'next/link';
import type { JSX } from 'react/jsx-runtime';

/**
 * 404 page displayed when a route or resource is not found.
 *
 * @returns {JSX.Element} Rendered not-found page with link back to home.
 */
export default function NotFound(): JSX.Element {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-5xl font-extrabold uppercase">404</h1>
      <p className="mt-2 text-black/70">The reel you&apos;re looking for has been moved or never existed.</p>
      <div className="mt-6">
        <Link
          href="/"
          className="shadow-brutal hover:shadow-brutal-lg active:shadow-brutal-press focus-visible:shadow-brutal inline-flex items-center justify-center gap-2 border-2 border-black bg-white px-5 py-2.5 text-sm font-bold tracking-wide uppercase transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:outline-none active:translate-x-0.5 active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
