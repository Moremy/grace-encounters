import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getAllPrayerRooms,
  togglePrayerRoomLive,
  endPrayerRoom,
} from '@/lib/prayer-room/actions';

export const metadata: Metadata = {
  title: 'Manage Prayer Rooms | Admin | Light Bearers',
  description: 'Manage live prayer rooms and sessions.',
};

export default async function AdminPrayerRoomsPage() {
  const rooms = await getAllPrayerRooms();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-navy">
            Manage Prayer Rooms
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create and manage prayer room sessions.
          </p>
        </div>
        <Button variant="sacred" asChild>
          <Link href="/prayer-rooms/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Room
          </Link>
        </Button>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            No prayer rooms have been created yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => {
            const isEnded = room.endAt !== null;
            const status = room.isLive
              ? 'Live'
              : isEnded
                ? 'Ended'
                : room.scheduledAt && new Date(room.scheduledAt) > new Date()
                  ? 'Scheduled'
                  : 'Draft';

            const statusColor = room.isLive
              ? 'bg-green-100 text-green-800'
              : isEnded
                ? 'bg-gray-100 text-gray-800'
                : 'bg-amber-100 text-amber-800';

            return (
              <Card key={room.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
                    >
                      {status}
                    </span>
                    <div>
                      <p className="font-medium text-navy">{room.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {room._count.participants} participants &middot;
                        Created{' '}
                        {new Date(room.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  {!isEnded && (
                    <div className="flex items-center gap-2">
                      <form action={togglePrayerRoomLive.bind(null, room.id)}>
                        <Button type="submit" variant="outline" size="sm">
                          {room.isLive ? 'Stop Live' : 'Go Live'}
                        </Button>
                      </form>
                      {room.isLive && (
                        <form action={endPrayerRoom.bind(null, room.id)}>
                          <Button type="submit" variant="destructive" size="sm">
                            End Session
                          </Button>
                        </form>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
