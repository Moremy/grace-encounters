import type { Metadata } from 'next';
import { Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createDevotional } from '@/lib/devotional/actions';

export const metadata: Metadata = {
  title: 'New Devotional | Admin | Light Bearers',
  description: 'Create a new devotional entry.',
};

export default function NewDevotionalPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const errorMessage =
    typeof searchParams.error === 'string'
      ? decodeURIComponent(searchParams.error)
      : undefined;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-navy">
          Create Devotional
        </h1>
        <p className="mt-2 text-muted-foreground">
          Write a new devotional to inspire and encourage the community.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex items-start gap-3 rounded-md bg-muted p-4">
        <Info className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">
          Scheduled devotionals will automatically become visible on their
          publish date.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Devotional Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createDevotional} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Finding Peace in the Storm"
                required
                minLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scriptureReference">Scripture Reference</Label>
              <Input
                id="scriptureReference"
                name="scriptureReference"
                placeholder="e.g. Psalm 46:10"
                required
                minLength={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scripture">Scripture Text</Label>
              <textarea
                id="scripture"
                name="scripture"
                placeholder="Enter the Bible verse text..."
                required
                minLength={3}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <textarea
                id="excerpt"
                name="excerpt"
                placeholder="A brief summary (10-300 characters)"
                required
                minLength={10}
                maxLength={300}
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                name="content"
                placeholder="Write the full devotional content..."
                required
                minLength={20}
                rows={12}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="SCHEDULED">Scheduled</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishDate">Publish Date</Label>
              <input
                type="datetime-local"
                id="publishDate"
                name="publishDate"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                Required for scheduled devotionals.
              </p>
            </div>

            <Button type="submit" variant="sacred">
              Create Devotional
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
