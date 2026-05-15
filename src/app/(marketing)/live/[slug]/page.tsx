import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Users } from 'lucide-react';

import { getStreamBySlug } from '@/lib/livestream/actions';
import { getStreamStatusLabel } from '@/lib/livestream/utils';
import { StreamPlayer } from '@/components/livestream/stream-player';
import { StreamChat } from '@/components/livestream/stream-chat';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const stream = await getStreamBySlug(params.slug);
  if (!stream) return { title: 'Stream Not Found' };
  return {
    title: `${stream.title} - Live Stream`,
    description: stream.description,
  };
}

export default async function StreamPage({ params }: PageProps) {
  const stream = await getStreamBySlug(params.slug);

  if (!stream) {
    notFound();
  }

  const isLive = stream.status === 'LIVE';
  const statusLabel = getStreamStatusLabel(stream.status);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/live"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Live Streams
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main Content */}
        <div className="space-y-4">
          <StreamPlayer
            streamUrl={stream.streamUrl}
            thumbnailUrl={stream.thumbnailUrl}
            title={stream.title}
            isLive={isLive}
          />

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  isLive
                    ? 'bg-red-500/15 text-red-600'
                    : 'bg-navy/10 text-navy'
                }`}
              >
                {statusLabel}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-gold">
                {stream.streamType}
              </span>
            </div>

            <h1 className="font-serif text-2xl text-navy md:text-3xl">
              {stream.title}
            </h1>

            <p className="text-muted-foreground">{stream.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {stream.createdBy?.displayName && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{stream.createdBy.displayName}</span>
                </div>
              )}
              {stream.scheduledAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(stream.scheduledAt).toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
              {isLive && (
                <div className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span>{stream.viewerCount} watching</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="h-[500px] lg:h-[calc(56.25vw*0.6+200px)] max-h-[700px]">
          <StreamChat streamId={stream.id} isLive={isLive} />
        </div>
      </div>
    </div>
  );
}
