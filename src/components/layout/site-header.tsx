'use client';

import * as React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Wordmark } from '@/components/brand/wordmark';
import { cn } from '@/lib/utils';

const navLinks: { label: string; href: string }[] = [
  { label: 'Testimonies', href: '#' },
  { label: 'Prayer Wall', href: '#' },
  { label: 'Devotionals', href: '#' },
  { label: 'About', href: '#' },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-colors duration-300',
        scrolled
          ? 'backdrop-blur-md bg-ivory/70 border-b border-border/50'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" aria-label="Grace Encounters home" className="flex items-center">
          <Wordmark size="md" />
        </Link>
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
        <Button variant="sacred" asChild>
          <Link href="#share">Share Your Story</Link>
        </Button>
      </div>
    </header>
  );
}
