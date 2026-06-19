import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getMyPrayerRequestById,
  updateMyPrayerRequest,
} from '@/lib/prayer/actions';

export const metadata: Metadata = {
  title: 'Edit Prayer Request | Light Bearers',
  description: 'Update your submitted prayer request.',
};

export default async function EditPrayerRequestPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const prayer = await getMyPrayerRequestById(params.id);

  // Not found, or it does not belong to the logged-in user.
  if (!prayer) {
    notFound();
  }

  // Only pending prayer requests may be edited.
  if (prayer.status !== 'PENDING') {
    const message = encodeURIComponent('This prayer request cannot be edited');
    redirect(`/prayer-wall/mine?error=${message}`);
  }

  const errorMessage =
    typeof searchParams.error === 'string'
      ? decodeURIComponent(searchParams.error)
      : undefined;

  const updateAction = updateMyPrayerRequest.bind(null, prayer.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-navy">
          Edit Prayer Request
        </h1>
        <p className="mt-2 text-muted-foreground">
          Update your prayer request below. It will be reviewed again before
          appearing on the public wall.
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
          Editing a prayer request resubmits it for review. Private requests are
          visible only to you.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prayer Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={prayer.title}
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
                defaultValue={prayer.content}
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
                  defaultChecked={prayer.visibility === 'PUBLIC'}
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
                  defaultChecked={prayer.visibility === 'ANONYMOUS'}
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
                  defaultChecked={prayer.visibility === 'PRIVATE'}
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

            <div className="flex items-center gap-3">
              <Button type="submit" variant="sacred">
                Save Changes
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/prayer-wall/mine">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
