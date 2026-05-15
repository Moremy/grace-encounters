import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FileText, Download } from 'lucide-react';

import { Reveal } from '@/components/brand/reveal';
import { AudioPlayer } from '@/components/media/audio-player';
import { VideoPlayer } from '@/components/media/video-player';
import { MediaCard } from '@/components/media/media-card';
import { Button } from '@/components/ui/button';
import { getMediaBySlug, getPublishedMedia } from '@/lib/media/actions';
import { getMediaTypeLabel, formatDuration } from '@/lib/media/utils';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const media = await getMediaBySlug(params.slug);
  if (!media) return { title: 'Media Not Found' };
  return {
    title: media.title,
    description: media.description,
  };
}

export default async function MediaDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const media = await getMediaBySlug(params.slug);

  if (!media) {
    notFound();
  }

  const isAudio =
    media.mediaType === 'SERMON_AUDIO' || media.mediaType === 'WORSHIP_AUDIO';
  const isVideo =
    media.mediaType === 'SERMON_VIDEO' || media.mediaType === 'VIDEO_MESSAGE';
  const isPdf = media.mediaType === 'PDF_RESOURCE';

  // Get related media in same category
  const related = await getPublishedMedia({ category: media.category });
  const relatedItems = related
    .filter((item) => item.id !== media.id)
    .slice(0, 4);

  return (
    <>
      <section className="bg-ivory py-16">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            {/* Player */}
            {isVideo && (
              <VideoPlayer
                src={media.url}
                poster={media.thumbnailUrl ?? undefined}
                title={media.title}
                className="mb-8"
              />
            )}

            {isAudio && (
              <AudioPlayer
                src={media.url}
                title={media.title}
                className="mb-8"
              />
            )}

            {isPdf && (
              <div className="mb-8 flex items-center gap-4 rounded-lg border border-border bg-background p-6">
                <FileText className="h-10 w-10 text-gold" />
                <div className="flex-1">
                  <p className="font-medium text-navy">{media.title}</p>
                  <p className="text-sm text-muted-foreground">PDF Resource</p>
                </div>
                <Button variant="sacred" asChild>
                  <a href={media.url} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              </div>
            )}

            {/* Metadata */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold">
                {getMediaTypeLabel(media.mediaType)}
              </span>
              <span className="text-xs capitalize text-muted-foreground">
                {media.category.toLowerCase()}
              </span>
              {media.duration && (
                <span className="text-xs text-muted-foreground">
                  {formatDuration(media.duration)}
                </span>
              )}
              {media.publishedAt && (
                <span className="text-xs text-muted-foreground">
                  {new Date(media.publishedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl text-navy">{media.title}</h1>

            {media.speaker?.displayName && (
              <p className="mt-2 text-sm text-muted-foreground">
                By {media.speaker.displayName}
              </p>
            )}

            <p className="mt-4 text-muted-foreground leading-relaxed">
              {media.description}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Related Media */}
      {relatedItems.length > 0 && (
        <section className="bg-background py-16">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <h2 className="font-serif text-2xl text-navy mb-6">
                Related Media
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedItems.map((item) => (
                  <MediaCard key={item.id} media={item} />
                ))}
              </div>
              <div className="mt-8 text-center">
                <Button variant="outline" asChild>
                  <Link href="/media">Browse All Media</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
