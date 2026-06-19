import * as React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { LighthouseMark } from '@/components/brand/lighthouse-mark';
import { MobileDrawer } from '@/components/layout/mobile-drawer';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';

const navLinks: { label: string; href: string; active?: boolean }[] = [
  { label: 'Home', href: '/', active: true },
  { label: 'About', href: '/about' },
  { label: 'Ministries', href: '/#ministries' },
  { label: 'Resources', href: '/media' },
  { label: 'Events', href: '/events' },
  { label: 'Contact', href: '/#contact' },
];

/**
 * Server-rendered marketing header with a solid teal background. Ships as
 * static markup — no scroll-driven backdrop effect.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#4A0E1A] text-white">
      <div className="flex h-16 w-full items-center px-8">
        <Link
          href="/"
          aria-label="Light Bearers home"
          className="flex shrink-0 items-center gap-3"
        >
          <LighthouseMark className="h-8 w-8 text-white" />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-base font-semibold uppercase tracking-wide">
              Light Bearers
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/70">
              Shining Truth. Transforming Lives.
            </span>
          </span>
        </Link>
        <nav
          aria-label="Primary"
          className="ml-auto mr-8 hidden items-center gap-6 md:flex"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={
                link.active
                  ? 'text-xs font-semibold uppercase tracking-widest text-white underline underline-offset-4'
                  : 'text-xs font-semibold uppercase tracking-widest text-white/80 hover:text-white transition-colors'
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-3 text-white">
          <LanguageSwitcher />
          <Button
            asChild
            className="bg-[#1A6B6B] text-white hover:bg-[#1A6B6B]/90"
          >
            <Link href="/donate">Give Today</Link>
          </Button>
          <div className="text-white">
            <MobileDrawer />
          </div>
        </div>
      </div>
    </header>
  );
}
