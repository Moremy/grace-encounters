import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MobileDrawer } from '@/components/layout/mobile-drawer';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';

const navLinks: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Ministries', href: '/#ministries' },
  { label: 'Resources', href: '/media' },
  { label: 'Events', href: '/events' },
  { label: 'Contact', href: '/#contact' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#4A0E1A] text-white">
      <div className="flex w-full items-center gap-4 px-4 py-3">
        {/* Logo */}
        <Link href="/" aria-label="Light Bearers home" className="shrink-0">
          <Image
            src="/images/logo.svg"
            alt="The Light Bearers Ministry"
            width={160}
            height={44}
            priority
            className="h-[44px] w-auto rounded-md bg-[#FDF6EC] px-2 py-1"
          />
        </Link>

        {/* Desktop nav — grows to fill available space */}
        <nav aria-label="Primary" className="hidden flex-1 items-center justify-center gap-5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[10px] font-semibold uppercase tracking-wider text-white/80 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
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
          <MobileDrawer />
        </div>
      </div>
    </header>
  );
}