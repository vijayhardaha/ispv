import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'scontent-ord5-1.cdninstagram.com', pathname: '/**' },
      { protocol: 'https', hostname: 'scontent.cdninstagram.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;
