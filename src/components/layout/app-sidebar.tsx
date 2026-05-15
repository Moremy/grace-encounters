import * as React from 'react';
import Link from 'next/link';
import { LayoutDashboard, BookHeart, HandHeart, Sun, User, Play, Headphones, Radio, BookOpen, Heart } from 'lucide-react';

import { Wordmark } from '@/components/brand/wordmark';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Testimonies', href: '/testimonies/mine', icon: BookHeart },
  { label: 'Prayer Wall', href: '/prayer-wall', icon: HandHeart },
  { label: 'Prayer Rooms', href: '/prayer-rooms', icon: Radio },
  { label: 'Bible Study', href: '/bible-study', icon: BookOpen },
  { label: 'Devotionals', href: '/devotionals', icon: Sun },
  { label: 'Media', href: '/media', icon: Play },
  { label: 'Sermons', href: '/sermons', icon: Headphones },
  { label: 'Giving', href: '/giving', icon: Heart },
  { label: 'Profile', href: '/profile', icon: User },
];

export function AppSidebar({ className }: { className?: string }) {
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
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-ivory/80 transition-colors hover:bg-gold/10 hover:text-gold"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
