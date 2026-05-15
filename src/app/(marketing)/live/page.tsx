import type { Metadata } from 'next';
import { Radio } from 'lucide-react';

import { getLiveStreams, getUpcomingStreams } from '@/lib/livestream/actions';
import { StreamCard } from '@/components/livestream/stream-card';
import { StreamSchedule } from '@/components/livestream/stream-schedule';

export const metadata: Metadata = {
  title: 'Live Streams - Light and Salt',
  description:
    'Watch live worship services, sermons, and special events from Light and Salt.',
};

export default async function LivePage() {
  const [liveStreams, upcomingStreams] = await Promise.all([
    getLiveStreams(),
    getUpcomingStreams(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-3xl text-navy md:text-4xl">
          Live Streams
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Join us live for worship services, sermons, and special events.
          Connect with our community in real time.
        </p>
      </div>

      {/* Currently Live */}
      {liveStreams.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="h-5 w-5 text-red-500 animate-pulse" />
            <h2 className="font-serif text-xl text-navy">Live Now</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {liveStreams.map((stream) => (
              <StreamCard
                key={stream.id}
                slug={stream.slug}
                title={stream.title}
                description={stream.description}
                thumbnailUrl={stream.thumbnailUrl}
                status={stream.status}
                scheduledAt={stream.scheduledAt}
                streamType={stream.streamType}
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Schedule */}
      <section className="mb-12">
        <h2 className="font-serif text-xl text-navy mb-4">Upcoming Streams</h2>
        {upcomingStreams.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingStreams.map((stream) => (
              <StreamCard
                key={stream.id}
                slug={stream.slug}
                title={stream.title}
                description={stream.description}
                thumbnailUrl={stream.thumbnailUrl}
                status={stream.status}
                scheduledAt={stream.scheduledAt}
                streamType={stream.streamType}
              />
            ))}
          </div>
        ) : (
          <StreamSchedule streams={[]} />
        )}
      </section>

      {/* No content fallback */}
      {liveStreams.length === 0 && upcomingStreams.length === 0 && (
        <div className="rounded-lg border border-border bg-card py-16 text-center">
          <Radio className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-navy">No live streams</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back soon for upcoming worship services and events.
          </p>
        </div>
      )}
    </div>
  );
}
