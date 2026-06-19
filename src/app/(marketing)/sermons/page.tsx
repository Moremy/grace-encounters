import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, Clock, User } from 'lucide-react';

import { Reveal } from '@/components/brand/reveal';
import { AudioPlayer } from '@/components/media/audio-player';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getPublishedSermons,
  getFeaturedSermons,
  getSermonSeries,
} from '@/lib/sermon/actions';
import { formatDuration } from '@/lib/media/utils';

export const metadata: Metadata = {
  title: 'Sermons',
  description:
    'Listen to sermons from Light Bearers. Browse by series, speaker, or topic.',
};

export default async function SermonsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const search =
    typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const speakerId =
    typeof searchParams.speaker === 'string' ? searchParams.speaker : undefined;

  const [sermons, featured, series] = await Promise.all([
    getPublishedSermons({ search, speakerId }),
    getFeaturedSermons(),
    getSermonSeries(),
  ]);

  const heroSermon = featured[0];

  return (
    <>
      {/* Hero */}
      <section className="bg-ivory py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            The Word
          </p>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl text-navy">
            Sermons
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-muted-foreground">
            Be encouraged and equipped through the teaching of God&apos;s Word.
            Listen online or download for later.
          </p>
        </div>
      </section>

      {/* Featured Sermon */}
      {heroSermon && (
        <section className="bg-background py-16">
          <div className="mx-auto max-w-4xl px-6">
            <Reveal>
              <Card className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {heroSermon.thumbnailUrl ? (
                    <div className="relative aspect-video md:aspect-square md:w-64 shrink-0">
                      <img
                        src={heroSermon.thumbnailUrl}
                        alt={heroSermon.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs uppercase tracking-wide text-gold font-medium">
                      Featured Sermon
                    </p>
                    <h2 className="mt-2 font-serif text-2xl text-navy">
                      {heroSermon.title}
                    </h2>
                    {heroSermon.speaker?.displayName && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {heroSermon.speaker.displayName}
                      </p>
                    )}
                    {heroSermon.scripture && (
                      <p className="mt-1 text-sm italic text-muted-foreground">
                        {heroSermon.scripture}
                      </p>
                    )}
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {heroSermon.description}
                    </p>
                    {heroSermon.audioUrl && (
                      <div className="mt-4">
                        <AudioPlayer src={heroSermon.audioUrl} />
                      </div>
                    )}
                    <div className="mt-4">
                      <Button variant="sacred" size="sm" asChild>
                        <Link href={`/sermons/${heroSermon.slug}`}>
                          View Full Sermon
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Reveal>
          </div>
        </section>
      )}

      {/* Sermon Series */}
      {series.length > 0 && (
        <section className="bg-ivory py-16">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <h2 className="font-serif text-2xl text-navy mb-6">
                Sermon Series
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {series.map((s) => (
                  <Link
                    key={s.id}
                    href={`/sermons/series/${s.slug}`}
                    className="group block"
                  >
                    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                      <div className="relative aspect-video bg-gradient-to-br from-gold/20 to-navy/10">
                        {s.coverImageUrl ? (
                          <img
                            src={s.coverImageUrl}
                            alt={s.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="font-serif text-xl text-gold/40">
                              {s.title[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-serif text-base font-medium text-navy group-hover:text-gold transition-colors">
                          {s.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {s._count?.sermons ?? 0} sermons
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Search & Recent Sermons */}
      <section className="bg-background py-16">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <h2 className="font-serif text-2xl text-navy">Recent Sermons</h2>
              <form className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search sermons..."
                  defaultValue={search ?? ''}
                  className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </form>
            </div>

            {sermons.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">
                  No sermons found. Check back soon.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sermons.map((sermon) => (
                  <Link
                    key={sermon.id}
                    href={`/sermons/${sermon.slug}`}
                    className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-gold/30"
                  >
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
                        {sermon.series && (
                          <span className="text-xs">
                            {sermon.series.title}
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
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
