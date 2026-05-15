import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Radio } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getAllStreams, startStream, endStream } from '@/lib/livestream/actions';
import { getStreamStatusLabel } from '@/lib/livestream/utils';

export const metadata: Metadata = {
  title: 'Manage Live Streams - Admin',
};

export default async function AdminLivestreamsPage() {
  const streams = await getAllStreams();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-navy">Manage Live Streams</h1>
        <Button variant="sacred" size="sm" asChild>
          <Link href="/admin/livestreams/new">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Stream
          </Link>
        </Button>
      </div>

      {streams.length === 0 ? (
        <div className="rounded-lg border border-border bg-card py-16 text-center">
          <p className="text-muted-foreground">No live streams yet.</p>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link href="/admin/livestreams/new">Schedule your first stream</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-ivory/50">
              <tr>
                <th className="px-4 py-3 font-medium text-navy">Title</th>
                <th className="px-4 py-3 font-medium text-navy">Type</th>
                <th className="px-4 py-3 font-medium text-navy">Status</th>
                <th className="px-4 py-3 font-medium text-navy">Scheduled</th>
                <th className="px-4 py-3 font-medium text-navy">Chat</th>
                <th className="px-4 py-3 font-medium text-navy">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {streams.map((stream) => {
                const statusLabel = getStreamStatusLabel(stream.status);
                const statusColors: Record<string, string> = {
                  SCHEDULED: 'bg-navy/10 text-navy',
                  LIVE: 'bg-red-500/15 text-red-600',
                  ENDED: 'bg-muted text-muted-foreground',
                };

                return (
                  <tr key={stream.id} className="hover:bg-ivory/30">
                    <td className="px-4 py-3 font-medium text-navy max-w-[200px] truncate">
                      {stream.title}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {stream.streamType}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[stream.status] ?? statusColors.ENDED}`}
                      >
                        {stream.status === 'LIVE' && (
                          <Radio className="h-3 w-3 animate-pulse" />
                        )}
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {stream.scheduledAt
                        ? new Date(stream.scheduledAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {stream._count.chatMessages}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {stream.status === 'SCHEDULED' && (
                          <form action={startStream.bind(null, stream.id)}>
                            <Button
                              type="submit"
                              variant="outline"
                              size="sm"
                            >
                              Go Live
                            </Button>
                          </form>
                        )}
                        {stream.status === 'LIVE' && (
                          <form action={endStream.bind(null, stream.id)}>
                            <Button
                              type="submit"
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              End Stream
                            </Button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
