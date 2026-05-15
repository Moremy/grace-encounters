'use client';

import * as React from 'react';
import { HandHeart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { prayForRequest } from '@/lib/prayer/actions';

interface PrayButtonProps {
  prayerRequestId: string;
  initialCount: number;
  hasPrayed?: boolean;
}

export function PrayButton({
  prayerRequestId,
  initialCount,
  hasPrayed = false,
}: PrayButtonProps) {
  const [count, setCount] = React.useState(initialCount);
  const [prayed, setPrayed] = React.useState(hasPrayed);
  const [isPending, startTransition] = React.useTransition();

  function handleClick() {
    // Optimistic update
    setCount((prev) => prev + 1);
    setPrayed(true);

    startTransition(async () => {
      await prayForRequest(prayerRequestId);
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={prayed}
      className={
        prayed
          ? 'border-gold text-gold'
          : isPending
            ? 'opacity-70 pointer-events-none'
            : ''
      }
    >
      <HandHeart className="mr-2 h-4 w-4" />
      I prayed for this
      <span className="ml-2 text-xs">{count}</span>
    </Button>
  );
}
