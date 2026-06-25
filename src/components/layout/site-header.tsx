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

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full overflow-hidden bg-[#4A0E1A] text-white">
      <div className="flex h-14 w-full items-center px-4">
        <Link
          href="/"
          aria-label="Light Bearers home"
          className="flex shrink-0 items-center gap-2"
        >
          <LighthouseMark className="h-7 w-7 text-white" />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-sm font-semibold uppercase tracking-wide">
              Light Bearers
            </span>
            <span className="text-[8px] uppercase tracking-[0.15em] text-white/70">
              Shining Truth. Transforming Lives.
            </span>
          </span>
        </Link>
        <nav
          aria-label="Primary"
          className="ml-auto mr-4 hidden items-center gap-4 md:flex"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={
                link.active
                  ? 'text-[10px] font-semibold uppercase tracking-wider text-white underline underline-offset-4'
                  : 'text-[10px] font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-colors'
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2 text-white">
          <div className="hidden sm:flex">
            <LanguageSwitcher />
          </div>
          <Button
            asChild
            size="sm"
            className="hidden sm:inline-flex bg-[#1A6B6B] text-white hover:bg-[#1A6B6B]/90 text-xs px-3"
          >
            <Link href="/donate">Give Today</Link>
          </Button>
          <div className="flex text-white">
            <MobileDrawer />
          </div>
        </div>
      </div>
    </header>
  );
}