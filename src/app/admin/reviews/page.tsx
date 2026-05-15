import type { Metadata } from 'next';
import { BookHeart } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getPendingTestimonies,
  updateTestimonyStatus,
} from '@/lib/testimony/actions';

export const metadata: Metadata = {
  title: 'Review Testimonies | Admin | Light and Salt',
  description: 'Review and moderate submitted testimonies.',
};

export default async function AdminReviewsPage() {
  const testimonies = await getPendingTestimonies();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-navy">
          Review Testimonies
        </h1>
        <p className="mt-2 text-muted-foreground">
          Approve, reject, or request revisions for submitted testimonies.
        </p>
      </div>

      {testimonies.length === 0 ? (
        <div className="text-center py-16">
          <BookHeart className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            No testimonies pending review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {testimonies.map((testimony) => (
            <Card key={testimony.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0">
                    <BookHeart className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {testimony.title}
                    </CardTitle>
                    <CardDescription>
                      By {testimony.author.displayName} &middot; Submitted{' '}
                      {new Date(testimony.createdAt).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        },
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Excerpt
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {testimony.excerpt}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Content Preview
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {testimony.content.slice(0, 300)}
                    {testimony.content.length > 300 && '...'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
                  <form
                    action={updateTestimonyStatus.bind(
                      null,
                      testimony.id,
                      'APPROVED',
                      undefined,
                    )}
                  >
                    <Button type="submit" variant="sacred" size="sm">
                      Approve
                    </Button>
                  </form>

                  <form
                    action={updateTestimonyStatus.bind(
                      null,
                      testimony.id,
                      'REJECTED',
                      undefined,
                    )}
                  >
                    <Button type="submit" variant="destructive" size="sm">
                      Reject
                    </Button>
                  </form>

                  <form
                    action={updateTestimonyStatus.bind(
                      null,
                      testimony.id,
                      'FEATURED',
                      undefined,
                    )}
                  >
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="border-gold text-gold hover:bg-gold/10"
                    >
                      Feature
                    </Button>
                  </form>
                </div>

                <details className="pt-2">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Request Revision
                  </summary>
                  <form
                    action={async (formData: FormData) => {
                      'use server';
                      const note = formData.get('revisionNote') as string;
                      await updateTestimonyStatus(
                        testimony.id,
                        'NEEDS_REVISION',
                        note,
                      );
                    }}
                    className="mt-3 space-y-3"
                  >
                    <div className="space-y-2">
                      <Label htmlFor={`revision-note-${testimony.id}`}>
                        Revision Note
                      </Label>
                      <Input
                        id={`revision-note-${testimony.id}`}
                        name="revisionNote"
                        placeholder="Describe what changes are needed..."
                        required
                      />
                    </div>
                    <Button type="submit" variant="outline" size="sm">
                      Send Revision Request
                    </Button>
                  </form>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
