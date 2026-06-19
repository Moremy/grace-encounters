import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PrayerRoomCard } from '@/components/prayer/prayer-room-card';
import { getPrayerRooms } from '@/lib/prayer-room/actions';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canModerate, fromPrismaRole } from '@/lib/auth/roles';

export const metadata: Metadata = {
  title: 'Prayer Rooms | Light Bearers',
  description: 'Join live prayer rooms and connect with the community in prayer.',
};

export default async function PrayerRoomsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isModerator = false;
  if (user) {
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    const role = fromPrismaRole(profile?.role ?? null);
    isModerator = canModerate(role);
  }

  const { liveRooms, upcomingRooms } = await getPrayerRooms();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-navy">
            Prayer Rooms
          </h1>
          <p className="mt-2 text-muted-foreground">
            Join a live prayer session or find an upcoming meeting.
          </p>
        </div>
        {isModerator && (
          <Button variant="sacred" asChild>
            <Link href="/prayer-rooms/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Room
            </Link>
          </Button>
        )}
      </div>

      {/* Live Now Section */}
      <section className="space-y-4">
        <h2 className="font-serif text-xl text-navy">Live Now</h2>
        {liveRooms.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No prayer rooms are live at the moment. Check back soon.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveRooms.map((room) => (
              <PrayerRoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Section */}
      <section className="space-y-4">
        <h2 className="font-serif text-xl text-navy">Upcoming</h2>
        {upcomingRooms.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No upcoming prayer rooms are scheduled.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingRooms.map((room) => (
              <PrayerRoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
