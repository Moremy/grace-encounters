import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';

import { cn } from '@/lib/utils';
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register';
import { InstallPrompt } from '@/components/pwa/install-prompt';

import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const viewport: Viewport = {
  themeColor: '#1e3a5f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Light and Salt — Real encounters with Jesus.',
  description: 'A reverent space for testimonies, prayer, and daily devotion.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Light and Salt',
  },
  openGraph: {
    title: 'Light and Salt — Real encounters with Jesus.',
    description: 'A reverent space for testimonies, prayer, and daily devotion.',
    type: 'website',
    siteName: 'Light and Salt',
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    apple: '/icons/icon-192x192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(fraunces.variable, inter.variable, 'h-full')}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        <ServiceWorkerRegister />
        <InstallPrompt />
      </body>
    </html>
  );
}
