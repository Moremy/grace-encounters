import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, FileText, Link2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllBooksAdmin, updateBookStatus, deleteBook } from '@/lib/book/actions';

export const metadata: Metadata = {
  title: 'Manage Books | Admin | Light Bearers',
  description: 'Upload books and manage reading recommendations.',
};

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
};

export default async function AdminBooksPage() {
  const books = await getAllBooksAdmin();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-navy">
            Manage Books
          </h1>
          <p className="mt-2 text-muted-foreground">
            Upload books for members to read, or suggest recommended reads.
          </p>
        </div>
        <Link href="/admin/books/new">
          <Button variant="sacred">Add Book</Button>
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            No books yet. Upload a book or add a recommendation to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {books.map((book) => (
            <Card key={book.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0">
                    {book.fileUrl ? (
                      <FileText className="h-5 w-5" />
                    ) : (
                      <BookOpen className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{book.title}</CardTitle>
                    <CardDescription>
                      by {book.author} &middot; Added{' '}
                      {new Date(book.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      <span
                        className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[book.status] ?? ''}`}
                      >
                        {statusLabels[book.status] ?? book.status}
                      </span>
                      <span className="ml-2 inline-block rounded-full bg-gold/15 px-2 py-0.5 text-xs font-medium text-gold">
                        {book.fileUrl ? 'Uploaded PDF' : 'Suggestion'}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {book.description.slice(0, 200)}
                  {book.description.length > 200 && '...'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
                  {book.fileUrl && (
                    <Button asChild variant="outline" size="sm">
                      <a href={book.fileUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-2 h-4 w-4" />
                        View PDF
                      </a>
                    </Button>
                  )}
                  {book.externalUrl && (
                    <Button asChild variant="outline" size="sm">
                      <a href={book.externalUrl} target="_blank" rel="noopener noreferrer">
                        <Link2 className="mr-2 h-4 w-4" />
                        External Link
                      </a>
                    </Button>
                  )}

                  {book.status === 'DRAFT' && (
                    <form action={updateBookStatus.bind(null, book.id, 'PUBLISHED')}>
                      <Button type="submit" variant="sacred" size="sm">
                        Publish
                      </Button>
                    </form>
                  )}

                  {book.status === 'PUBLISHED' && (
                    <form action={updateBookStatus.bind(null, book.id, 'DRAFT')}>
                      <Button type="submit" variant="outline" size="sm">
                        Unpublish
                      </Button>
                    </form>
                  )}

                  <form action={deleteBook.bind(null, book.id)}>
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
