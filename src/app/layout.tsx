import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { cookies } from 'next/headers';

import { cn } from '@/lib/utils';
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { LocaleProvider } from '@/lib/i18n/locale-context';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { defaultLocale, LOCALE_COOKIE, isValidLocale } from '@/lib/i18n/config';

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
  title: 'Light Bearers — Shining Truth. Transforming Lives.',
  description: 'A reverent space for testimonies, prayer, and daily devotion.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Light Bearers',
  },
  openGraph: {
    title: 'Light Bearers — Shining Truth. Transforming Lives.',
    description: 'A reverent space for testimonies, prayer, and daily devotion.',
    type: 'website',
    siteName: 'Light Bearers',
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    apple: '/icons/icon-192x192.png',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = localeCookie && isValidLocale(localeCookie) ? localeCookie : defaultLocale;
  const dictionary = await getDictionary(locale);

  return (
    <html
      lang={locale}
      className={cn(fraunces.variable, inter.variable, 'h-full')}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <LocaleProvider locale={locale} dictionary={dictionary}>
          {children}
        </LocaleProvider>
        <ServiceWorkerRegister />
        <InstallPrompt />
      </body>
    </html>
  );
}
