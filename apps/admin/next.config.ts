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
  reactStrictMode: true,

  // ---- Security & headers ----
  poweredByHeader: false,

  // ---- Remote images ----
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.cdninstagram.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'blob.vercel-storage.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;
