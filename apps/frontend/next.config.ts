/**
 * ======================================================================
 * Next Configuration
 * ======================================================================
 * Purpose: Centralized runtime and build-time configuration for Next.js.
 * Docs:    https://nextjs.org/docs/app/api-reference/config/next-config-js
 * ======================================================================
 */

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ---- Core runtime settings ----
  // Enable React strict mode to surface unsafe lifecycles and other issues
  // during development
  reactStrictMode: true,

  // ----------------------------------------------------------------------
  // BUILD OPTIMIZATIONS
  // ----------------------------------------------------------------------
  // Example: Power-user features (uncomment as needed)
  /* compiler: {
		// Removes console logs in production (except errors)
		removeConsole: process.env.NODE_ENV === "production",
	},
	*/

  // ---- Security & headers ----
  // Remove `X-Powered-By` header for a slightly improved security posture
  poweredByHeader: false,

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'blob.vercel-storage.com', pathname: '/**' },
    ],
  },

  // Rewrite /og/preview.png to the OG image route for static file compatibility
  async rewrites() {
    return [{ source: '/og/preview.png', destination: '/og' }];
  },
};

export default nextConfig;
