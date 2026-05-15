import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { createSermon } from '@/lib/sermon/actions';
import { getSermonSeries } from '@/lib/sermon/actions';

export const metadata: Metadata = {
  title: 'Add Sermon - Admin',
};

export default async function AdminNewSermonPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const error =
    typeof searchParams.error === 'string' ? searchParams.error : undefined;

  const series = await getSermonSeries();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/sermons"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sermons
        </Link>
      </div>

      <h1 className="font-serif text-2xl text-navy mb-6">Add Sermon</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={createSermon} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required placeholder="Sermon title" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            placeholder="Sermon description..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="scripture">Scripture Reference (optional)</Label>
            <Input
              id="scripture"
              name="scripture"
              placeholder="e.g. John 3:16-17"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="speakerId">Speaker ID</Label>
            <Input
              id="speakerId"
              name="speakerId"
              required
              placeholder="Profile UUID"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seriesId">Series (optional)</Label>
          <select
            id="seriesId"
            name="seriesId"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="">No series</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="audioUrl">Audio URL (optional)</Label>
          <Input
            id="audioUrl"
            name="audioUrl"
            type="url"
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="videoUrl">Video URL (optional)</Label>
          <Input
            id="videoUrl"
            name="videoUrl"
            type="url"
            placeholder="https://..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="transcriptUrl">Transcript URL (optional)</Label>
            <Input
              id="transcriptUrl"
              name="transcriptUrl"
              type="url"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notesUrl">Notes URL (optional)</Label>
            <Input
              id="notesUrl"
              name="notesUrl"
              type="url"
              placeholder="https://..."
            />
          </div>
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

        <div className="space-y-2">
          <Label htmlFor="duration">Duration (seconds, optional)</Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            min={0}
            placeholder="e.g. 2400"
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
            Create Sermon
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/admin/sermons">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
