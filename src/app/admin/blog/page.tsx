import type { Metadata } from 'next';
import Link from 'next/link';
import { PenLine } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllArticlesAdmin, updateArticleStatus } from '@/lib/blog/actions';

export const metadata: Metadata = {
  title: 'Manage Blog Articles | Admin | Light Bearers',
  description: 'Create, edit, and manage blog articles.',
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

const categoryLabels: Record<string, string> = {
  DEVOTIONAL_THOUGHT: 'Devotional Thought',
  FAITH_LIVING: 'Faith Living',
  TESTIMONY_REFLECTION: 'Testimony Reflection',
  CHURCH_NEWS: 'Church News',
  MISSIONS: 'Missions',
  PRAYER: 'Prayer',
};

export default async function AdminBlogPage() {
  const articles = await getAllArticlesAdmin();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-navy">
            Manage Blog Articles
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create, publish, and schedule blog articles.
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button variant="sacred">New Article</Button>
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-16">
          <PenLine className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            No articles yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {articles.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0">
                    <PenLine className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {article.title}
                    </CardTitle>
                    <CardDescription>
                      By {article.author.displayName} &middot; Created{' '}
                      {new Date(article.createdAt).toLocaleDateString(
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
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block rounded-full bg-gold/15 text-gold px-2 py-0.5 text-xs font-medium">
                    {categoryLabels[article.category] ?? article.category}
                  </span>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[article.status] ?? ''}`}
                  >
                    {statusLabels[article.status] ?? article.status}
                  </span>
                  {article.featured && (
                    <span className="inline-block rounded-full bg-gold/20 text-gold px-2 py-0.5 text-xs font-medium">
                      Featured
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {article.excerpt.slice(0, 200)}
                  {article.excerpt.length > 200 && '...'}
                </p>

                {article.publishDate && (
                  <p className="text-xs text-muted-foreground">
                    Publish date:{' '}
                    {new Date(article.publishDate).toLocaleDateString(
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

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
                  {(article.status === 'DRAFT' ||
                    article.status === 'SCHEDULED') && (
                    <form
                      action={updateArticleStatus.bind(
                        null,
                        article.id,
                        'PUBLISHED',
                      )}
                    >
                      <Button type="submit" variant="sacred" size="sm">
                        Publish
                      </Button>
                    </form>
                  )}

                  {article.status === 'PUBLISHED' && (
                    <form
                      action={updateArticleStatus.bind(
                        null,
                        article.id,
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
