import * as React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Twitter, MapPin, Phone, Mail, Globe } from 'lucide-react';

import { LighthouseMark } from '@/components/brand/lighthouse-mark';
import { CurrentYear } from '@/components/layout/current-year';

type FooterColumn = {
  heading: string;
  links: { label: string; href: string }[];
};

const columns: FooterColumn[] = [
  {
    heading: 'Quick Links',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/#about' },
      { label: 'Ministries', href: '/#ministries' },
      { label: 'Events', href: '/events' },
      { label: 'Donate', href: '/donate' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Bible Study', href: '/bible-study' },
      { label: 'Books', href: '/books' },
      { label: 'Blog', href: '/blog' },
      { label: 'Devotionals', href: '/devotionals' },
      { label: 'Media', href: '/media' },
      { label: 'Community', href: '/community' },
    ],
  },
];

const socials: { label: string; href: string; Icon: React.ComponentType<{ className?: string }> }[] =
  [
    { label: 'Facebook', href: '#facebook', Icon: Facebook },
    { label: 'Instagram', href: '#instagram', Icon: Instagram },
    { label: 'YouTube', href: '#youtube', Icon: Youtube },
    { label: 'Twitter', href: '#twitter', Icon: Twitter },
  ];

export function SiteFooter() {
  return (
    <footer id="contact" className="scroll-mt-20 bg-teal text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" aria-label="Light Bearers home" className="flex items-center gap-3">
              <LighthouseMark className="h-9 w-9 shrink-0 text-white" />
              <span className="font-serif text-lg font-semibold uppercase tracking-wide">
                Light Bearers
              </span>
            </Link>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white/70">
              Shining Truth. Transforming Lives.
            </p>
            <p className="mt-4 max-w-xs text-sm text-white/80">
              A reverent home for testimonies, prayer, and daily devotion — gathering people
              around the truth that transforms lives.
            </p>
            <div className="mt-6 flex items-center gap-4">
              {socials.map(({ label, href, Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-white/80 transition-colors hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <h3 className="font-serif text-sm uppercase tracking-widest text-white">
                {column.heading}
              </h3>
              <ul className="mt-4 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/80 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-serif text-sm uppercase tracking-widest text-white">
              Get in Touch
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>P.O. Box 1218, Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+254700000000" className="transition-colors hover:text-white">
                  +254 700 000 000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a
                  href="mailto:hello@lightbearers.org"
                  className="transition-colors hover:text-white"
                >
                  hello@lightbearers.org
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4 shrink-0" />
                <span>www.lightbearers.org</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <p className="text-center text-sm text-white/70">
            © <CurrentYear /> Light Bearers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
