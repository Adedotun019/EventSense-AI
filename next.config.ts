import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {},
    async headers() {
    return [];
  }
};

export default nextConfig;
