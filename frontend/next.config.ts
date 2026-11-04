import type { NextConfig } from 'next';
import type { RemotePattern } from 'next/dist/shared/lib/image-config';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

/** Allow next/image to load uploads served by the API host itself. */
const apiPattern = (): RemotePattern[] => {
  try {
    const { protocol, hostname, port } = new URL(API_URL);
    return [{ protocol: protocol.replace(':', '') as 'http' | 'https', hostname, port, pathname: '/**' }];
  } catch {
    return [];
  }
};

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Keep in sync with src/utils/remoteImages.ts.
    remotePatterns: [
      ...apiPattern(),
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: 'api.mapbox.com' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async redirects() {
    // Old Vite-era URLs.
    return [
      { source: '/trail', destination: '/trails', permanent: true },
      { source: '/add-trails', destination: '/add-trail', permanent: true },
    ];
  },
};

export default nextConfig;
