import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getMyTestimonyBySlug,
  updateMyTestimony,
} from '@/lib/testimony/actions';

export const metadata: Metadata = {
  title: 'Edit Testimony | Light Bearers',
  description: 'Update your submitted testimony.',
};

const EDITABLE_STATUSES = ['PENDING', 'NEEDS_REVISION'];

export default async function EditTestimonyPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const testimony = await getMyTestimonyBySlug(params.slug);

  // Not found, or it does not belong to the logged-in user.
  if (!testimony) {
    notFound();
  }

  // Approved/rejected/featured testimonies are locked from editing.
  if (!EDITABLE_STATUSES.includes(testimony.status)) {
    const message = encodeURIComponent(
      'Approved testimonies cannot be edited.',
    );
    redirect(`/testimonies/mine?error=${message}`);
  }

  const errorMessage =
    typeof searchParams.error === 'string'
      ? decodeURIComponent(searchParams.error)
      : undefined;

  const updateAction = updateMyTestimony.bind(null, testimony.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-navy">
          Edit Testimony
        </h1>
        <p className="mt-2 text-muted-foreground">
          Update your testimony below. Your changes will be reviewed again
          before being published.
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
          Editing a testimony will resubmit it for review. This process usually
          takes 1-2 business days.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Testimony Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={testimony.title}
                placeholder="e.g. How God Healed My Marriage"
                required
                minLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Full Testimony</Label>
              <textarea
                id="content"
                name="content"
                defaultValue={testimony.content}
                placeholder="Share the full story of what God has done..."
                required
                minLength={50}
                rows={10}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                name="displayName"
                defaultValue={testimony.author.displayName ?? ''}
                placeholder="The name shown alongside your testimony"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to be shown as Anonymous on this and your other
                content.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" variant="sacred">
                Save Changes
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/testimonies/mine">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
