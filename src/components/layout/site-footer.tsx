import * as React from 'react';
import Link from 'next/link';

import { Wordmark } from '@/components/brand/wordmark';
import { CurrentYear } from '@/components/layout/current-year';

type FooterColumn = {
  heading: string;
  links: { label: string; href: string }[];
};

const columns: FooterColumn[] = [
  {
    heading: 'Explore',
    links: [
      { label: 'Testimonies', href: '#' },
      { label: 'Prayer Wall', href: '#' },
      { label: 'Devotionals', href: '#' },
      { label: 'Scripture', href: '#' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Share Your Story', href: '#' },
      { label: 'Submit a Prayer', href: '#' },
      { label: 'Guidelines', href: '#' },
    ],
  },
  {
    heading: 'About',
    links: [
      { label: 'Our Mission', href: '#' },
      { label: 'Statement of Faith', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Moderation', href: '#' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {columns.map((column) => (
            <div key={column.heading}>
              <h3 className="font-serif text-sm uppercase tracking-widest text-navy">
                {column.heading}
              </h3>
              <ul className="mt-4 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <span className="mt-12 block h-px w-full bg-gold/40" aria-hidden="true" />

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Wordmark size="sm" variant="mono" />
          <p className="italic text-sm text-muted-foreground">
            Submitted testimonies are reviewed before publishing.
          </p>
          <p className="text-sm text-muted-foreground">
            © <CurrentYear /> Grace Encounters.
          </p>
        </div>
      </div>
    </footer>
  );
}
