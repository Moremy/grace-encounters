import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { createStream } from '@/lib/livestream/actions';

export const metadata: Metadata = {
  title: 'Schedule Stream - Admin',
};

export default function AdminNewStreamPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const error =
    typeof searchParams.error === 'string' ? searchParams.error : undefined;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/livestreams"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Live Streams
        </Link>
      </div>

      <h1 className="font-serif text-2xl text-navy mb-6">Schedule Stream</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={createStream} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required placeholder="Stream title" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            placeholder="Describe this live stream..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="streamType">Stream Type</Label>
            <select
              id="streamType"
              name="streamType"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            >
              <option value="WORSHIP">Worship</option>
              <option value="SERMON">Sermon</option>
              <option value="EVENT">Event</option>
              <option value="SPECIAL">Special</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
            <Input
              id="scheduledAt"
              name="scheduledAt"
              type="datetime-local"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="streamUrl">Stream URL (optional)</Label>
          <Input
            id="streamUrl"
            name="streamUrl"
            type="url"
            placeholder="https://youtube.com/watch?v=... or HLS URL"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
          <Input
            id="thumbnailUrl"
            name="thumbnailUrl"
            type="url"
            placeholder="https://..."
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="sacred">
            Schedule Stream
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/admin/livestreams">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
