import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Download, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

import { Reveal } from '@/components/brand/reveal';
import { AudioPlayer } from '@/components/media/audio-player';
import { VideoPlayer } from '@/components/media/video-player';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getSermonBySlug } from '@/lib/sermon/actions';
import { formatDuration } from '@/lib/media/utils';
import { TranscriptToggle } from './transcript-toggle';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const sermon = await getSermonBySlug(params.slug);
  if (!sermon) return { title: 'Sermon Not Found' };
  return {
    title: sermon.title,
    description: sermon.description,
  };
}

export default async function SermonDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const sermon = await getSermonBySlug(params.slug);

  if (!sermon) {
    notFound();
  }

  // Series navigation
  let prevSermon: { slug: string; title: string } | null = null;
  let nextSermon: { slug: string; title: string } | null = null;

  if (sermon.series?.sermons) {
    const sermons = sermon.series.sermons;
    const currentIndex = sermons.findIndex((s) => s.id === sermon.id);
    if (currentIndex > 0) {
      prevSermon = sermons[currentIndex - 1];
    }
    if (currentIndex < sermons.length - 1) {
      nextSermon = sermons[currentIndex + 1];
    }
  }

  return (
    <>
      <section className="bg-ivory py-16">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            {/* Series breadcrumb */}
            {sermon.series && (
              <div className="mb-4">
                <Link
                  href={`/sermons/series/${sermon.series.slug}`}
                  className="text-sm text-gold hover:underline"
                >
                  Part of {sermon.series.title}
                </Link>
              </div>
            )}

            {/* Title & Speaker */}
            <h1 className="font-serif text-3xl md:text-4xl text-navy">
              {sermon.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              {sermon.speaker && (
                <div className="flex items-center gap-2">
                  {sermon.speaker.avatarUrl ? (
                    <img
                      src={sermon.speaker.avatarUrl}
                      alt={sermon.speaker.displayName ?? 'Speaker'}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs text-ivory">
                      {(sermon.speaker.displayName ?? 'S')[0]}
                    </div>
                  )}
                  <span className="text-sm font-medium text-navy">
                    {sermon.speaker.displayName}
                  </span>
                </div>
              )}

              {sermon.publishedAt && (
                <span className="text-sm text-muted-foreground">
                  {new Date(sermon.publishedAt).toLocaleDateString()}
                </span>
              )}

              {sermon.duration && (
                <span className="text-sm text-muted-foreground">
                  {formatDuration(sermon.duration)}
                </span>
              )}
            </div>

            {sermon.scripture && (
              <div className="mt-4 flex items-center gap-2 rounded-md bg-gold/10 px-3 py-2">
                <BookOpen className="h-4 w-4 text-gold" />
                <span className="text-sm font-medium text-navy">
                  {sermon.scripture}
                </span>
              </div>
            )}

            {/* Audio Player */}
            {sermon.audioUrl && (
              <div className="mt-6">
                <AudioPlayer
                  src={sermon.audioUrl}
                  title={sermon.title}
                />
              </div>
            )}

            {/* Video Player */}
            {sermon.videoUrl && (
              <div className="mt-6">
                <VideoPlayer
                  src={sermon.videoUrl}
                  poster={sermon.thumbnailUrl ?? undefined}
                  title={sermon.title}
                />
              </div>
            )}

            {/* Description */}
            <p className="mt-6 text-muted-foreground leading-relaxed">
              {sermon.description}
            </p>

            {/* Transcript Toggle */}
            {sermon.transcriptUrl && (
              <div className="mt-6">
                <TranscriptToggle url={sermon.transcriptUrl} />
              </div>
            )}

            {/* Download Notes */}
            {sermon.notesUrl && (
              <div className="mt-6">
                <Button variant="outline" asChild>
                  <a
                    href={sermon.notesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Sermon Notes
                  </a>
                </Button>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* Series Navigation */}
      {(prevSermon || nextSermon) && (
        <section className="bg-background py-12 border-t">
          <div className="mx-auto max-w-4xl px-6">
            <Reveal>
              <div className="flex items-center justify-between">
                {prevSermon ? (
                  <Link
                    href={`/sermons/${prevSermon.slug}`}
                    className="flex items-center gap-2 text-sm text-navy hover:text-gold transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">{prevSermon.title}</span>
                    <span className="sm:hidden">Previous</span>
                  </Link>
                ) : (
                  <div />
                )}
                {nextSermon ? (
                  <Link
                    href={`/sermons/${nextSermon.slug}`}
                    className="flex items-center gap-2 text-sm text-navy hover:text-gold transition-colors"
                  >
                    <span className="hidden sm:inline">{nextSermon.title}</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
