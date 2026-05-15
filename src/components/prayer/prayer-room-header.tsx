import { Users, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { togglePrayerRoomLive, endPrayerRoom } from '@/lib/prayer-room/actions';

interface PrayerRoomHeaderProps {
  room: {
    id: string;
    title: string;
    isLive: boolean;
    scheduledAt: Date | null;
  };
  participantCount: number;
  isModerator: boolean;
}

export function PrayerRoomHeader({
  room,
  participantCount,
  isModerator,
}: PrayerRoomHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Radio className="h-5 w-5 text-gold" />
        <div>
          <h1 className="font-serif text-2xl text-navy">{room.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            {room.isLive ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Live Now
              </span>
            ) : room.scheduledAt ? (
              <span className="text-xs text-muted-foreground">
                Scheduled:{' '}
                {new Date(room.scheduledAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            ) : null}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {participantCount}
            </span>
          </div>
        </div>
      </div>
      {isModerator && (
        <div className="flex items-center gap-2">
          <form action={togglePrayerRoomLive.bind(null, room.id)}>
            <Button type="submit" variant="outline" size="sm">
              {room.isLive ? 'End Live' : 'Go Live'}
            </Button>
          </form>
          <form action={endPrayerRoom.bind(null, room.id)}>
            <Button type="submit" variant="destructive" size="sm">
              End Session
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
