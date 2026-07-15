import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, Globe } from 'lucide-react';

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

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V9.01a8.16 8.16 0 0 0 4.77 1.52V7.09a4.85 4.85 0 0 1-1.84-.4z" />
    </svg>
  );
}

const socials: { label: string; href: string; Icon: React.ComponentType<{ className?: string }> }[] =
  [
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/people/Light-Bearers-Global-Ministry/61590475810349/',
      Icon: Facebook,
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/lightbearersglobalministry?igsh=MWRqYmM5aDd5c3l6Yg==',
      Icon: Instagram,
    },
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/@LightBearersGlobalINT',
      Icon: Youtube,
    },
    {
      label: 'TikTok',
      href: 'https://www.tiktok.com/@lghtbeareresminis',
      Icon: TikTokIcon,
    },
  ];

export function SiteFooter() {
  return (
    <footer id="contact" className="scroll-mt-20 bg-teal text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" aria-label="Light Bearers home" className="inline-flex items-center">
              <Image
                src="/images/logo.svg"
                alt="The Light Bearers Ministry"
                width={180}
                height={50}
                className="h-[50px] w-auto rounded-md bg-[#FDF6EC] px-2 py-1"
              />
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
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-white/80 transition-colors hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </a>
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
