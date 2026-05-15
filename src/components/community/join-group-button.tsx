'use client';

import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { joinGroup, leaveGroup } from '@/lib/community/actions';

interface JoinGroupButtonProps {
  groupId: string;
  initialIsMember: boolean;
}

export function JoinGroupButton({
  groupId,
  initialIsMember,
}: JoinGroupButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      if (initialIsMember) {
        await leaveGroup(groupId);
      } else {
        await joinGroup(groupId);
      }
    });
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant={initialIsMember ? 'outline' : 'sacred'}
    >
      {isPending
        ? 'Loading...'
        : initialIsMember
          ? 'Leave Group'
          : 'Join Group'}
    </Button>
  );
}
