import type { Metadata } from 'next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createEvent } from '@/lib/event/actions';

export const metadata: Metadata = {
  title: 'New Event | Admin | Light and Salt',
  description: 'Create a new crusade or event.',
};

export default function NewEventPage({
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
          Create Event
        </h1>
        <p className="mt-2 text-muted-foreground">
          Create a new crusade or event for the community.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 text-sm">
          {errorMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createEvent} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Night of Encounter"
                required
                minLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe the event..."
                required
                minLength={10}
                rows={6}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g. Grace Assembly Hall, Nairobi"
                required
                minLength={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Start Date & Time</Label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                required
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date & Time (optional)</Label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="featured">Featured event</Label>
            </div>

            <Button type="submit" variant="sacred">
              Create Event
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
