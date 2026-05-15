import * as React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Wordmark } from '@/components/brand/wordmark';
import { ScrollAwareShell } from '@/components/layout/scroll-aware-shell';
import { MobileDrawer } from '@/components/layout/mobile-drawer';

const navLinks: { label: string; href: string }[] = [
  { label: 'Books', href: '/books' },
  { label: 'Blog', href: '/blog' },
  { label: 'Events', href: '/events' },
  { label: 'Media', href: '/media' },
  { label: 'Community', href: '/community' },
];

/**
 * Server-rendered marketing header. The only piece that needs the browser
 * is the scroll-driven backdrop blur, which is isolated in
 * `<ScrollAwareShell>` so the wordmark, nav links, and CTA ship as static
 * markup.
 */
export function SiteHeader() {
  return (
    <ScrollAwareShell
      className="sticky top-0 z-40 w-full transition-colors duration-300"
      baseClassName="bg-transparent"
      scrolledClassName="backdrop-blur-md bg-ivory/70 border-b border-border/50"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MobileDrawer />
          <Link href="/" aria-label="Grace Encounters home" className="flex items-center">
            <Wordmark size="md" />
          </Link>
        </div>
        <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-foreground/80 transition-colors hover:text-primary hover:underline underline-offset-4"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Button variant="sacred" asChild className="hidden sm:inline-flex">
          <Link href="#share">Share Your Story</Link>
        </Button>
      </div>
    </ScrollAwareShell>
  );
}
