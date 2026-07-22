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
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'scontent-ord5-1.cdninstagram.com', pathname: '/**' },
      { protocol: 'https', hostname: 'scontent.cdninstagram.com', pathname: '/**' },
    ],
  },

  async redirects() {
    return [{ source: '/thumbnail.png', destination: '/preview.png', permanent: true }];
  },
};

export default nextConfig;
