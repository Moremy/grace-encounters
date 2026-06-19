import type { Metadata } from 'next';
import Link from 'next/link';
import { Sun } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getAllDevotionalsAdmin,
  updateDevotionalStatus,
} from '@/lib/devotional/actions';

export const metadata: Metadata = {
  title: 'Manage Devotionals | Admin | Light Bearers',
  description: 'Create, edit, and manage daily devotionals.',
};

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  SCHEDULED: 'Scheduled',
};

export default async function AdminDevotionalsPage() {
  const devotionals = await getAllDevotionalsAdmin();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-navy">
            Manage Devotionals
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create, publish, and schedule daily devotionals.
          </p>
        </div>
        <Link href="/admin/devotionals/new">
          <Button variant="sacred">New Devotional</Button>
        </Link>
      </div>

      {devotionals.length === 0 ? (
        <div className="text-center py-16">
          <Sun className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            No devotionals yet. Create your first devotional to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {devotionals.map((devotional) => (
            <Card key={devotional.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0">
                    <Sun className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {devotional.title}
                    </CardTitle>
                    <CardDescription>
                      By {devotional.author.displayName} &middot; Created{' '}
                      {new Date(devotional.createdAt).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        },
                      )}
                      <span
                        className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[devotional.status] ?? ''}`}
                      >
                        {statusLabels[devotional.status] ?? devotional.status}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-navy">
                    {devotional.scriptureReference}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {devotional.excerpt.slice(0, 200)}
                    {devotional.excerpt.length > 200 && '...'}
                  </p>
                  {devotional.publishDate && (
                    <p className="text-xs text-muted-foreground">
                      Publish date:{' '}
                      {new Date(devotional.publishDate).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        },
                      )}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
                  {(devotional.status === 'DRAFT' ||
                    devotional.status === 'SCHEDULED') && (
                    <form
                      action={updateDevotionalStatus.bind(
                        null,
                        devotional.id,
                        'PUBLISHED',
                      )}
                    >
                      <Button type="submit" variant="sacred" size="sm">
                        Publish
                      </Button>
                    </form>
                  )}

                  {devotional.status === 'PUBLISHED' && (
                    <form
                      action={updateDevotionalStatus.bind(
                        null,
                        devotional.id,
                        'DRAFT',
                      )}
                    >
                      <Button type="submit" variant="outline" size="sm">
                        Unpublish
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
