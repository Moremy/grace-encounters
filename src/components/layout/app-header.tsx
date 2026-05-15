'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { signOut } from '@/lib/auth/actions';

export function AppHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border/60 bg-card px-6">
      <p className="text-sm text-muted-foreground">Welcome back</p>
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
