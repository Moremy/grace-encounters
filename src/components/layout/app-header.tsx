'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth/actions';

export function AppHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border/60 bg-card px-6">
      <p className="text-sm text-muted-foreground">Welcome back</p>
      <div className="flex items-center gap-4">
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
