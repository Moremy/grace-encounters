import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
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
      <div className="flex w-full items-center px-4 py-4">
        <Link
          href="/"
          aria-label="Light Bearers home"
          className="flex shrink-0 items-center"
        >
          <Image
            src="/images/logo.svg"
            alt="The Light Bearers Ministry"
            width={180}
            height={50}
            priority
            className="h-[50px] w-auto rounded-md bg-[#FDF6EC] px-2 py-1"
          />
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