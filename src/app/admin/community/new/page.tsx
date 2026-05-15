import type { Metadata } from 'next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createGroup } from '@/lib/community/actions';

export const metadata: Metadata = {
  title: 'New Community Group | Admin | Light and Salt',
  description: 'Create a new community group.',
};

export default function NewCommunityGroupPage({
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
          Create Community Group
        </h1>
        <p className="mt-2 text-muted-foreground">
          Create a new group for the community to gather and connect.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 text-sm">
          {errorMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Group Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createGroup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Women of Faith Bible Study"
                required
                minLength={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe what this group is about..."
                required
                minLength={10}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                required
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a category</option>
                <option value="PRAYER">Prayer</option>
                <option value="BIBLE_STUDY">Bible Study</option>
                <option value="WORSHIP">Worship</option>
                <option value="FELLOWSHIP">Fellowship</option>
                <option value="OUTREACH">Outreach</option>
                <option value="YOUTH">Youth</option>
                <option value="WOMEN">Women</option>
                <option value="MEN">Men</option>
              </select>
            </div>

            <Button type="submit" variant="sacred">
              Create Group
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
