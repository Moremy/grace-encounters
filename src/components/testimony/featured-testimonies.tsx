'use client';

import * as React from 'react';
import Link from 'next/link';
import { BookHeart, FileText, Headphones, Play } from 'lucide-react';
import { Reveal } from '@/components/brand/reveal';
import { Button } from '@/components/ui/button';

interface FeaturedTestimony {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  mediaType: string;
  category: string | null;
  author: { displayName: string | null };
}

interface FeaturedTestimoniesProps {
  testimonies: FeaturedTestimony[];
}

const MEDIA_ICONS: Record<string, React.ReactNode> = {
  TEXT: <BookHeart className="h-5 w-5" />,
  PDF: <FileText className="h-5 w-5" />,
  AUDIO: <Headphones className="h-5 w-5" />,
  VIDEO: <Play className="h-5 w-5" />,
};

export function FeaturedTestimonies({ testimonies }: FeaturedTestimoniesProps) {
  if (testimonies.length === 0) return null;

  return (
    <section className="bg-ivory py-16">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <span
            aria-hidden="true"
            className="mb-4 block h-px w-12 bg-gold"
          />
          <h2 className="font-serif text-2xl md:text-3xl text-navy">
            Featured Testimonies
          </h2>
        </Reveal>

        <div className="mt-8 flex gap-6 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory">
          {testimonies.map((testimony) => (
            <Reveal key={testimony.id} delay={0.1}>
              <div className="min-w-[320px] max-w-[360px] snap-start rounded-lg border border-navy/10 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold">
                    {MEDIA_ICONS[testimony.mediaType] ?? MEDIA_ICONS.TEXT}
                  </div>
                  {testimony.category && (
                    <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-medium text-gold">
                      {testimony.category.charAt(0) + testimony.category.slice(1).toLowerCase()}
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-lg text-navy line-clamp-2">
                  {testimony.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                  {testimony.excerpt}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {testimony.author.displayName}
                </p>
                <Button variant="link" className="mt-3 px-0" asChild>
                  <Link href={`/testimonies/${testimony.slug}`}>Read More</Link>
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
