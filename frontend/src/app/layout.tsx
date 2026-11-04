import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import './globals.css';
import Providers from './providers';
import AppShell from '@/components/layout/AppShell';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Gantabya | Elsendero', template: '%s | Gantabya' },
  description:
    'Gantabya (Elsendero) — discover, create and share travel trails on an interactive map, and plan group trips with event chat.',
  applicationName: 'Gantabya',
  openGraph: { siteName: 'Gantabya', type: 'website' },
};

export const viewport: Viewport = {
  themeColor: '#06402b',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
