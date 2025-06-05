import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Adjust the following values to suit your needs
  // This is for increasing the size of files that can be uploaded
  requestSizeLimit: 500 * 1024 * 1024, // 500MB
  isrMemoryCacheSize: 0,
  serverComponentsExternalPackages: ["shiki"],
  experimental: {},
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  }
};

export default nextConfig;
