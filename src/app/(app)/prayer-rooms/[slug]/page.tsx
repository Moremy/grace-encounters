import * as React from 'react';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { Button } from '@/components/ui/button';
import { PrayerRoomHeader } from '@/components/prayer/prayer-room-header';
import { PrayerRoomChat } from '@/components/prayer/prayer-room-chat';
import {
  getPrayerRoomBySlug,
  getPrayerRoomMessages,
  joinPrayerRoom,
  leavePrayerRoom,
} from '@/lib/prayer-room/actions';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canModerate, fromPrismaRole } from '@/lib/auth/roles';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const room = await getPrayerRoomBySlug(params.slug);
  if (!room) return { title: 'Prayer Room | Light and Salt' };
  return {
    title: `${room.title} | Prayer Rooms | Light and Salt`,
    description: room.description,
  };
}

export default async function PrayerRoomPage({ params }: Props) {
  const room = await getPrayerRoomBySlug(params.slug);
  if (!room) notFound();

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  const role = fromPrismaRole(profile?.role ?? null);
  const isModerator = canModerate(role);

  const messages = await getPrayerRoomMessages(room.id);
  const isParticipant = room.participants.some((p) => p.userId === user.id);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <PrayerRoomHeader
        room={room}
        participantCount={room._count.participants}
        isModerator={isModerator}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex flex-1 flex-col border-r border-border/60">
          <PrayerRoomChat
            roomId={room.id}
            messages={messages}
            currentUserId={user.id}
          />
        </div>

        {/* Participant Sidebar */}
        <aside className="hidden w-64 flex-col overflow-y-auto p-4 md:flex">
          <h3 className="text-sm font-semibold text-navy mb-3">
            Participants ({room._count.participants})
          </h3>
          <ul className="space-y-2">
            {room.participants.map((participant) => (
              <li
                key={participant.id}
                className="flex items-center gap-2 text-sm"
              >
                <span className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-muted-foreground">
                  {participant.user.displayName ?? 'Anonymous'}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-4">
            {isParticipant ? (
              <form action={leavePrayerRoom.bind(null, room.id)}>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Leave Room
                </Button>
              </form>
            ) : (
              <form action={joinPrayerRoom.bind(null, room.id)}>
                <Button type="submit" variant="sacred" size="sm" className="w-full">
                  Join Room
                </Button>
              </form>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile Join/Leave - shown below chat on mobile */}
      <div className="border-t border-border/60 p-3 md:hidden">
        {isParticipant ? (
          <form action={leavePrayerRoom.bind(null, room.id)}>
            <Button type="submit" variant="outline" size="sm" className="w-full">
              Leave Room
            </Button>
          </form>
        ) : (
          <form action={joinPrayerRoom.bind(null, room.id)}>
            <Button type="submit" variant="sacred" size="sm" className="w-full">
              Join Room
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
