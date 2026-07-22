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

  async redirects() {
    return [{ source: '/thumbnail.png', destination: '/preview.png', permanent: true }];
  },
};

export default nextConfig;
