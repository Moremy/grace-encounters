'use client';
import * as React from 'react';
import Link from 'next/link';
import { Search, MessageSquare, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { signOut } from '@/lib/auth/actions';
import { useSidebar } from '@/components/layout/sidebar-shell';

export function AppHeader() {
  const { setOpen } = useSidebar();
  return (
    <header className="flex h-16 items-center justify-between border-b border-border/60 bg-card px-6">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden rounded-md p-1 text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="text-sm text-muted-foreground">Welcome back</p>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/search" aria-label="Search">
            <Search className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild className="relative">
          <Link href="/messages" aria-label="Messages">
            <MessageSquare className="h-4 w-4" />
          </Link>
        </Button>
        <NotificationBell />
        <form action={signOut}>
          <Button variant="ghost" size="sm" type="submit">
            Sign Out
          </Button>
        </form>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-medium text-ivory"
          aria-label="User avatar"
        >
          GE
        </div>
      </div>
    </header>
  );
}