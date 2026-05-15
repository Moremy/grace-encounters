import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, User } from 'lucide-react';

import { Reveal } from '@/components/brand/reveal';
import { Button } from '@/components/ui/button';
import { getSeriesBySlug } from '@/lib/sermon/actions';
import { formatDuration } from '@/lib/media/utils';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const series = await getSeriesBySlug(params.slug);
  if (!series) return { title: 'Series Not Found' };
  return {
    title: `${series.title} - Sermon Series`,
    description: series.description,
  };
}

export default async function SeriesDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const series = await getSeriesBySlug(params.slug);

  if (!series) {
    notFound();
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-ivory py-16">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              {series.coverImageUrl ? (
                <div className="w-full md:w-64 shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={series.coverImageUrl}
                    alt={series.title}
                    className="h-full w-full object-cover aspect-video md:aspect-square"
                  />
                </div>
              ) : (
                <div className="flex h-40 w-full md:w-64 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gold/20 to-navy/10">
                  <span className="font-serif text-4xl text-gold/40">
                    {series.title[0]}
                  </span>
                </div>
              )}

              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Sermon Series
                </p>
                <h1 className="mt-2 font-serif text-3xl text-navy">
                  {series.title}
                </h1>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {series.description}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {series.sermons.length}{' '}
                  {series.sermons.length === 1 ? 'sermon' : 'sermons'}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Sermons List */}
      <section className="bg-background py-16">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <h2 className="font-serif text-2xl text-navy mb-6">Sermons</h2>
            <div className="space-y-3">
              {series.sermons.map((sermon, index) => (
                <Link
                  key={sermon.id}
                  href={`/sermons/${sermon.slug}`}
                  className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-gold/30"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ivory text-sm font-medium text-navy">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-navy group-hover:text-gold transition-colors truncate">
                      {sermon.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {sermon.speaker?.displayName && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {sermon.speaker.displayName}
                        </span>
                      )}
                      {sermon.publishedAt && (
                        <span>
                          {new Date(sermon.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {sermon.duration && (
                    <span className="shrink-0 flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(sermon.duration)}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button variant="outline" asChild>
                <Link href="/sermons">Back to All Sermons</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
