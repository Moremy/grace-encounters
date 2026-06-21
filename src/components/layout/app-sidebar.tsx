import * as React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  LayoutDashboard,
  BookHeart,
  ScrollText,
  HandHeart,
  Sun,
  User,
  Play,
  Headphones,
  BookOpen,
  Heart,
  MessageSquare,
  Bell,
  Settings,
  Users,
  CalendarDays,
  Newspaper,
  HelpingHand,
  ShieldCheck,
} from 'lucide-react';

import { Wordmark } from '@/components/brand/wordmark';
import { cn } from '@/lib/utils';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { defaultLocale, LOCALE_COOKIE, isValidLocale } from '@/lib/i18n/config';

/** Translation keys mapped to nav items. Labels are used as fallbacks. */
const navItems = [
  { label: 'Dashboard', translationKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Share Testimony', translationKey: 'nav.shareTestimony', href: '/testimonies/new', icon: BookHeart },
  { label: 'My Testimonies', translationKey: 'nav.myTestimonies', href: '/testimonies/mine', icon: ScrollText },
  { label: 'Prayer Wall', translationKey: 'nav.prayerWall', href: '/prayer-wall', icon: HandHeart },
  { label: 'Devotionals', translationKey: 'nav.devotionals', href: '/devotionals', icon: Sun },
  { label: 'Bible Study', translationKey: 'nav.bibleStudy', href: '/dashboard/bible-study', icon: BookOpen },
  { label: 'Media', translationKey: 'nav.media', href: '/media', icon: Play },
  { label: 'Sermons', translationKey: 'nav.sermons', href: '/sermons', icon: Headphones },
  { label: 'Blog', translationKey: 'nav.blog', href: '/blog', icon: Newspaper },
  { label: 'Events', translationKey: 'nav.events', href: '/events', icon: CalendarDays },
  { label: 'Community', translationKey: 'nav.community', href: '/community', icon: Users },
  { label: 'Messages', translationKey: 'nav.messages', href: '/messages', icon: MessageSquare },
  { label: 'Notifications', translationKey: 'nav.notifications', href: '/notifications', icon: Bell },
  { label: 'Giving', translationKey: 'nav.giving', href: '/donate', icon: Heart },
  { label: 'Fundraisers', translationKey: 'nav.fundraisers', href: '/dashboard/fundraisers', icon: HelpingHand },
  { label: 'Counselling', translationKey: 'nav.counselling', href: '/dashboard/counselling', icon: ShieldCheck },
  { label: 'Profile', translationKey: 'nav.profile', href: '/profile', icon: User },
  { label: 'Settings', translationKey: 'nav.settings', href: '/settings', icon: Settings },
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
        <Link href="/dashboard" aria-label="Light Bearers home">
          <Wordmark />
        </Link>
      </div>
      <nav aria-label="Member navigation" className="flex-1 overflow-y-auto px-3 py-4">
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
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{displayLabel}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}