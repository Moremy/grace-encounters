import type { Metadata } from 'next';
import { Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createBook } from '@/lib/book/actions';

export const metadata: Metadata = {
  title: 'Add Book | Admin | Light Bearers',
  description: 'Upload a book or add a reading recommendation.',
};

export default function NewBookPage({
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
          Add Book
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upload a PDF for members to read on the site, or suggest a
          recommended book.
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
          Attach a PDF file to make the book readable and downloadable on the
          books page. Leave the file empty to list it as a suggestion — you
          can optionally add an external link to where the book can be found.
          Only upload files the ministry has the rights to share.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Book Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createBook} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. The Pursuit of God"
                required
                minLength={2}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                name="author"
                placeholder="e.g. A.W. Tozer"
                required
                minLength={2}
                maxLength={120}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                placeholder="What is this book about, and why do you recommend it? (10-1000 characters)"
                required
                minLength={10}
                maxLength={1000}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Book PDF (optional)</Label>
              <input
                type="file"
                id="file"
                name="file"
                accept="application/pdf,.pdf"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                PDF only, up to 20MB. Members will be able to read and
                download it from the books page.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="externalUrl">External Link (optional)</Label>
              <Input
                id="externalUrl"
                name="externalUrl"
                type="url"
                placeholder="https://example.com/where-to-find-the-book"
              />
              <p className="text-xs text-muted-foreground">
                For suggestions: a link to where the book can be read or
                purchased.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            <Button type="submit" variant="sacred">
              Add Book
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
