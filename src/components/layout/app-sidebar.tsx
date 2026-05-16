import * as React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { LayoutDashboard, BookHeart, HandHeart, Sun, User, Play, Headphones, Radio, BookOpen, Heart, MessageSquare } from 'lucide-react';

import { Wordmark } from '@/components/brand/wordmark';
import { cn } from '@/lib/utils';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { defaultLocale, LOCALE_COOKIE, isValidLocale } from '@/lib/i18n/config';

/** Translation keys mapped to nav items. Labels are used as fallbacks. */
const navItems = [
  { label: 'Dashboard', translationKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Testimonies', translationKey: 'nav.testimonies', href: '/testimonies/mine', icon: BookHeart },
  { label: 'Prayer Wall', translationKey: 'nav.prayerWall', href: '/prayer-wall', icon: HandHeart },
  { label: 'Prayer Rooms', translationKey: 'nav.prayerRooms', href: '/prayer-rooms', icon: Radio },
  { label: 'Bible Study', translationKey: 'nav.bibleStudy', href: '/bible-study', icon: BookOpen },
  { label: 'Devotionals', translationKey: 'nav.devotionals', href: '/devotionals', icon: Sun },
  { label: 'Media', translationKey: 'nav.media', href: '/media', icon: Play },
  { label: 'Sermons', translationKey: 'nav.sermons', href: '/sermons', icon: Headphones },
  { label: 'Messages', translationKey: 'nav.messages', href: '/messages', icon: MessageSquare },
  { label: 'Giving', translationKey: 'nav.giving', href: '/giving', icon: Heart },
  { label: 'Profile', translationKey: 'nav.profile', href: '/profile', icon: User },
];

function resolveKey(dictionary: Record<string, Record<string, string>>, key: string): string {
  const parts = key.split('.');
  if (parts.length === 2) {
    const [namespace, field] = parts;
    const section = dictionary[namespace!];
    if (section && field! in section) {
      return section[field!];
    }
  }
  return key;
}

export async function AppSidebar({ className }: { className?: string }) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = localeCookie && isValidLocale(localeCookie) ? localeCookie : defaultLocale;
  const dictionary = await getDictionary(locale);

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col bg-navy text-ivory',
        className,
      )}
    >
      <div className="flex items-center px-6 py-5">
        <Link href="/dashboard" aria-label="Light and Salt home">
          <Wordmark variant="inverted" size="md" />
        </Link>
      </div>
      <nav aria-label="Member navigation" className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const translated = resolveKey(dictionary, item.translationKey);
            const displayLabel = translated === item.translationKey ? item.label : translated;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-ivory/80 transition-colors hover:bg-gold/10 hover:text-gold"
                >
                  <item.icon className="h-4 w-4" />
                  {displayLabel}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
