import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { createMediaItem } from '@/lib/media/actions';

export const metadata: Metadata = {
  title: 'Add Media Item - Admin',
};

export default function AdminNewMediaPage({
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
          href="/admin/media"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Media
        </Link>
      </div>

      <h1 className="font-serif text-2xl text-navy mb-6">Add Media Item</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={createMediaItem} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required placeholder="Media title" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            placeholder="Brief description of this media..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mediaType">Media Type</Label>
            <select
              id="mediaType"
              name="mediaType"
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            >
              <option value="">Select type...</option>
              <option value="SERMON_AUDIO">Sermon Audio</option>
              <option value="SERMON_VIDEO">Sermon Video</option>
              <option value="WORSHIP_AUDIO">Worship Audio</option>
              <option value="VIDEO_MESSAGE">Video Message</option>
              <option value="PDF_RESOURCE">PDF Resource</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            >
              <option value="">Select category...</option>
              <option value="SERMON">Sermon</option>
              <option value="WORSHIP">Worship</option>
              <option value="TEACHING">Teaching</option>
              <option value="TESTIMONY">Testimony</option>
              <option value="CONFERENCE">Conference</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">Media URL</Label>
          <Input
            id="url"
            name="url"
            type="url"
            required
            placeholder="https://..."
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (seconds, optional)</Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              min={0}
              placeholder="e.g. 3600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="speakerId">Speaker ID (optional)</Label>
            <Input
              id="speakerId"
              name="speakerId"
              placeholder="Profile UUID"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="playlistId">Playlist ID (optional)</Label>
          <Input
            id="playlistId"
            name="playlistId"
            placeholder="Playlist ID"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            className="h-4 w-4 rounded border-border text-gold focus:ring-gold"
          />
          <Label htmlFor="featured">Featured</Label>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="sacred">
            Create Media Item
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/admin/media">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
