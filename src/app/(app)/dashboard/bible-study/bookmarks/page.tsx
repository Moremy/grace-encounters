import * as React from 'react';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScriptureBookmarkCard } from '@/components/bible-study/scripture-bookmark';
import { getMyBookmarks, addBookmark } from '@/lib/bible-study/actions';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Scripture Bookmarks | Light Bearers',
  description: 'Your saved scripture bookmarks and notes.',
};

async function handleAddBookmark(formData: FormData) {
  'use server';
  const reference = formData.get('reference') as string;
  const content = formData.get('content') as string;
  const note = formData.get('note') as string;
  await addBookmark(reference, content || undefined, note || undefined);
}

export default async function BookmarksPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const bookmarks = await getMyBookmarks();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-navy">
          Scripture Bookmarks
        </h1>
        <p className="mt-2 text-muted-foreground">
          Save and revisit your favorite passages.
        </p>
      </div>

      {/* Add Bookmark Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Bookmark</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleAddBookmark} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Scripture Reference</Label>
              <Input
                id="reference"
                name="reference"
                placeholder="John 3:16"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Scripture Text (optional)</Label>
              <textarea
                id="content"
                name="content"
                placeholder="For God so loved the world..."
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Personal Note (optional)</Label>
              <textarea
                id="note"
                name="note"
                placeholder="Why this passage is meaningful to you..."
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold min-h-[60px]"
              />
            </div>
            <Button type="submit" variant="sacred">
              Save Bookmark
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bookmarks List */}
      {bookmarks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            You have not saved any scripture bookmarks yet. Start by adding your
            favorite passage above.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {bookmarks.map((bookmark) => (
            <ScriptureBookmarkCard key={bookmark.id} bookmark={bookmark} />
          ))}
        </div>
      )}
    </div>
  );
}
