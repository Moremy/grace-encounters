'use client';

import * as React from 'react';

/**
 * Renders today's date in the visitor's locale and timezone.
 *
 * Kept as a tiny client component so the surrounding marketing page can stay
 * statically rendered. On the server pass we emit nothing (the markup is empty)
 * which avoids hydration mismatches and prevents a stale build-time date from
 * being served to users in another timezone.
 */
export function TodayDate({ className }: { className?: string }) {
  const [today, setToday] = React.useState<string>('');

  React.useEffect(() => {
    setToday(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    );
  }, []);

  return (
    <p className={className} suppressHydrationWarning>
      {today}
    </p>
  );
}
