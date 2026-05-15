import * as React from 'react';

import { Button } from '@/components/ui/button';

export function AppHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border/60 bg-card px-6">
      <p className="text-sm text-muted-foreground">Welcome back</p>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm">
          Sign Out
        </Button>
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
