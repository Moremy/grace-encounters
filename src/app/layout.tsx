import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';

import { cn } from '@/lib/utils';

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

export const metadata: Metadata = {
  title: 'Grace Encounters — Real encounters with Jesus.',
  description: 'A reverent space for testimonies, prayer, and daily devotion.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  openGraph: {
    title: 'Grace Encounters — Real encounters with Jesus.',
    description: 'A reverent space for testimonies, prayer, and daily devotion.',
    type: 'website',
    siteName: 'Grace Encounters',
  },
  twitter: {
    card: 'summary_large_image',
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
      </body>
    </html>
  );
}
