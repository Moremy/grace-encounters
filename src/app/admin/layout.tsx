import * as React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  Sun,
  Settings,
  HandHeart,
  Calendar,
  PenLine,
  BookHeart,
  BookOpen,
  Library,
  Play,
  Headphones,
  Heart,
  BarChart3,
  Shield,
  ShieldCheck,
  ScrollText,
} from 'lucide-react';

import { Wordmark } from '@/components/brand/wordmark';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Moderation', href: '/admin/moderation', icon: Shield },
  { label: 'Pending Reviews', href: '/admin/reviews', icon: ClipboardCheck },
  { label: 'Testimonies', href: '/admin/testimonies', icon: BookHeart },
  { label: 'Prayer Requests', href: '/admin/prayers', icon: HandHeart },
  { label: 'Counselling', href: '/admin/counselling', icon: ShieldCheck },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Devotionals', href: '/admin/devotionals', icon: Sun },
  { label: 'Bible Study', href: '/admin/bible-study', icon: BookOpen },
  { label: 'Books', href: '/admin/books', icon: Library },
  { label: 'Community', href: '/admin/community', icon: Users },
  { label: 'Media', href: '/admin/media', icon: Play },
  { label: 'Sermons', href: '/admin/sermons', icon: Headphones },
  { label: 'Donations', href: '/admin/donations', icon: Heart },
  { label: 'Fundraisers', href: '/admin/fundraisers', icon: HandHeart },
  { label: 'Events', href: '/admin/events', icon: Calendar },
  { label: 'Blog', href: '/admin/blog', icon: PenLine },
  { label: 'Audit Log', href: '/admin/audit-log', icon: ScrollText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

function AdminSidebar({ className }: { className?: string }) {
  return (
    <aside className={cn('flex h-full w-64 flex-col bg-navy-700 text-ivory', className)}>
      <div className="flex items-center gap-3 px-6 py-5">
        <Link href="/admin" aria-label="Admin home">
          <Wordmark size="md" />
        </Link>
        <span className="rounded bg-gold/20 px-2 py-0.5 text-xs font-semibold text-gold">
          Admin
        </span>
      </div>
      <nav aria-label="Admin navigation" className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {adminNavItems.map((item) => (
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

function AdminHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border/60 bg-card px-6">
      <p className="text-sm font-medium text-navy">Admin Panel</p>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">Exit Admin</Link>
        </Button>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-medium text-ivory"
          aria-label="Admin avatar"
        >
          A
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar className="flex" />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <AdminHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
