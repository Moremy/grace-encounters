import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/brand/reveal';
import { getDevotionalBySlug } from '@/lib/devotional/actions';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const devotional = await getDevotionalBySlug(params.slug);

  if (!devotional) {
    return { title: 'Devotional Not Found' };
  }

  return {
    title: devotional.title,
    description: devotional.excerpt,
  };
}

export default async function DevotionalDetailPage({ params }: Props) {
  const devotional = await getDevotionalBySlug(params.slug);

  if (!devotional) {
    notFound();
  }

  return (
    <>
      <section className="bg-ivory py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {devotional.featured && (
            <span className="inline-block rounded-full bg-gold/15 text-gold px-3 py-1 text-xs font-medium mb-4">
              Featured
            </span>
          )}
          <h1 className="font-serif text-3xl md:text-4xl text-navy">
            {devotional.title}
          </h1>
          <p className="mt-4 text-muted-foreground italic">
            {devotional.scriptureReference}
          </p>
          <p className="mt-2 text-muted-foreground">
            By {devotional.author.displayName}
          </p>
          {devotional.publishDate && (
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(devotional.publishDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <blockquote className="pl-6 border-l-4 border-gold font-serif text-xl italic text-navy">
              {devotional.scripture}
            </blockquote>
            <p className="mt-3 text-sm text-muted-foreground">
              {devotional.scriptureReference}
            </p>

            <div className="mt-12 whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {devotional.content}
            </div>
          </Reveal>

          <div className="mt-16">
            <Button variant="outline" asChild>
              <Link href="/devotionals">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Devotionals
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
