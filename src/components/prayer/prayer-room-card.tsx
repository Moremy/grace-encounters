import Link from 'next/link';
import { Users } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PrayerRoomCardProps {
  room: {
    id: string;
    slug: string;
    title: string;
    description: string;
    isLive: boolean;
    scheduledAt: Date | null;
    maxParticipants: number;
    _count: { participants: number };
  };
}

export function PrayerRoomCard({ room }: PrayerRoomCardProps) {
  return (
    <Link href={`/prayer-rooms/${room.slug}`} className="group block">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{room.title}</CardTitle>
            {room.isLive && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                LIVE
              </span>
            )}
          </div>
          <CardDescription className="line-clamp-2">
            {room.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {room._count.participants} / {room.maxParticipants}
              </span>
            </div>
            {room.scheduledAt && !room.isLive && (
              <span className="text-xs text-muted-foreground">
                {new Date(room.scheduledAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
          <Button variant="sacred" size="sm" className="mt-4 w-full">
            Join Room
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
