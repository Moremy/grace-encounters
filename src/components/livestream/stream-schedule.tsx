'use client';

import { Clock, Calendar } from 'lucide-react';

interface ScheduleStream {
  id: string;
  slug: string;
  title: string;
  streamType: string;
  scheduledAt: string | Date | null;
}

interface StreamScheduleProps {
  streams: ScheduleStream[];
}

export function StreamSchedule({ streams }: StreamScheduleProps) {
  if (streams.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card py-12 text-center">
        <Calendar className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-muted-foreground text-sm">
          No upcoming streams scheduled.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {streams.map((stream) => {
        const scheduledDate = stream.scheduledAt
          ? new Date(stream.scheduledAt)
          : null;

        return (
          <div
            key={stream.id}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-navy/5">
              <Clock className="h-5 w-5 text-navy" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-navy truncate">{stream.title}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-medium uppercase tracking-wide text-gold">
                  {stream.streamType}
                </span>
                {scheduledDate && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {scheduledDate.toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
