import type { Metadata } from 'next';
import { Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPrayerRequest } from '@/lib/prayer/actions';

export const metadata: Metadata = {
  title: 'Submit a Prayer Request | Light and Salt',
  description: 'Share your prayer needs with the community.',
};

export default function NewPrayerRequestPage({
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
          Submit a Prayer Request
        </h1>
        <p className="mt-2 text-muted-foreground">
          Share what is on your heart. Our community will stand with you in
          prayer.
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
          Your prayer request will be reviewed by our team before appearing on
          the public wall. Private requests are visible only to you.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prayer Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createPrayerRequest} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Prayer for healing"
                required
                minLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Prayer Request</Label>
              <textarea
                id="content"
                name="content"
                placeholder="Share what you'd like prayer for..."
                required
                minLength={10}
                rows={5}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Visibility</legend>
              <label className="flex items-start gap-3 rounded-md border p-4 transition-colors has-[:checked]:border-gold has-[:checked]:bg-gold/5">
                <input
                  type="radio"
                  name="visibility"
                  value="PUBLIC"
                  defaultChecked
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium">Public</p>
                  <p className="text-xs text-muted-foreground">
                    Your name and prayer will be visible to everyone
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 rounded-md border p-4 transition-colors has-[:checked]:border-gold has-[:checked]:bg-gold/5">
                <input
                  type="radio"
                  name="visibility"
                  value="ANONYMOUS"
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium">Anonymous</p>
                  <p className="text-xs text-muted-foreground">
                    Your prayer will be visible but your name will be hidden
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 rounded-md border p-4 transition-colors has-[:checked]:border-gold has-[:checked]:bg-gold/5">
                <input
                  type="radio"
                  name="visibility"
                  value="PRIVATE"
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium">Private</p>
                  <p className="text-xs text-muted-foreground">
                    Only you can see this prayer request
                  </p>
                </div>
              </label>
            </fieldset>

            <Button type="submit" variant="sacred">
              Submit Prayer Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
