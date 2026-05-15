import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, PlayCircle } from 'lucide-react';

import { getStreamReplays } from '@/lib/livestream/actions';
import { StreamCard } from '@/components/livestream/stream-card';

export const metadata: Metadata = {
  title: 'Stream Replays - Light and Salt',
  description: 'Watch replays of past live worship services, sermons, and events.',
};

export default async function ReplaysPage() {
  const replays = await getStreamReplays();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6">
        <Link
          href="/live"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Live Streams
        </Link>
      </div>

      <div className="mb-10">
        <h1 className="font-serif text-3xl text-navy md:text-4xl">
          Stream Replays
        </h1>
        <p className="mt-3 text-muted-foreground">
          Watch replays of past live worship services, sermons, and special events.
        </p>
      </div>

      {replays.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {replays.map((stream) => (
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
        <div className="rounded-lg border border-border bg-card py-16 text-center">
          <PlayCircle className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-navy">No replays yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Past live streams will appear here once they conclude.
          </p>
        </div>
      )}
    </div>
  );
}
