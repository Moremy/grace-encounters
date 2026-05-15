import * as React from 'react';
import Link from 'next/link';
import { Youtube, Headphones, Instagram } from 'lucide-react';

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
      { label: 'Books', href: '/books' },
      { label: 'Blog', href: '/blog' },
      { label: 'News', href: '/news' },
      { label: 'Events', href: '/events' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Join Community', href: '/community' },
      { label: 'Share Your Story', href: '#' },
      { label: 'Submit a Prayer', href: '#' },
      { label: 'Guidelines', href: '#' },
    ],
  },
  {
    heading: 'Media',
    links: [
      { label: 'YouTube Channel', href: '#youtube' },
      { label: 'Podcast', href: '#podcast' },
      { label: 'Instagram', href: '#instagram' },
      { label: 'Facebook', href: '#facebook' },
      { label: 'X / Twitter', href: '#twitter' },
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

          <div className="flex items-center gap-4">
            <Link
              href="#youtube"
              className="text-muted-foreground transition-colors hover:text-primary"
              aria-label="YouTube"
            >
              <Youtube className="h-5 w-5" />
            </Link>
            <Link
              href="#podcast"
              className="text-muted-foreground transition-colors hover:text-primary"
              aria-label="Podcast"
            >
              <Headphones className="h-5 w-5" />
            </Link>
            <Link
              href="#instagram"
              className="text-muted-foreground transition-colors hover:text-primary"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            © <CurrentYear /> Grace Encounters.
          </p>
        </div>
      </div>
    </footer>
  );
}
