import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/brand/reveal';
import { MediaPlayer } from '@/components/testimony/media-player';
import { getTestimonyBySlug } from '@/lib/testimony/actions';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const testimony = await getTestimonyBySlug(params.slug);

  if (!testimony) {
    return { title: 'Testimony Not Found' };
  }

  return {
    title: testimony.title,
    description: testimony.excerpt,
  };
}

export default async function TestimonyDetailPage({ params }: Props) {
  const testimony = await getTestimonyBySlug(params.slug);

  if (!testimony) {
    notFound();
  }

  const authorName = testimony.isAnonymous
    ? 'Anonymous'
    : testimony.author?.displayName ?? 'Anonymous';

  return (
    <>
      <section className="bg-ivory py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {testimony.status === 'FEATURED' && (
            <span className="inline-block rounded-full bg-purple-100 text-purple-800 px-3 py-1 text-xs font-medium mb-4">
              Featured
            </span>
          )}

          <h1 className="font-serif text-3xl md:text-4xl text-navy">
            {testimony.title}
          </h1>

          <p className="mt-4 text-muted-foreground">By {authorName}</p>

          {testimony.publishedAt && (
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(testimony.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}

          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            {testimony.category && (
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold">
                {testimony.category.charAt(0) +
                  testimony.category.slice(1).toLowerCase()}
              </span>
            )}

            {testimony.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-navy/5 px-3 py-1 text-xs text-navy/70"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            {testimony.mediaUrl && testimony.mediaType !== 'TEXT' && (
              <div className="mb-10">
                <MediaPlayer
                  mediaType={testimony.mediaType as 'AUDIO' | 'VIDEO' | 'PDF'}
                  mediaUrl={testimony.mediaUrl}
                  title={testimony.title}
                />
              </div>
            )}

            <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {testimony.content}
            </div>
          </Reveal>

          <div className="mt-16">
            <Button variant="outline" asChild>
              <Link href="/testimonies">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Testimonies
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}