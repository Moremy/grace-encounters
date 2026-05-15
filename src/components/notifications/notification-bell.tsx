'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

export function NotificationBell() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/notifications/unread');
        if (res.ok) {
          const data = await res.json();
          setCount(data.count ?? 0);
        }
      } catch {
        // Silently fail - notifications are non-critical
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5 text-navy" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
