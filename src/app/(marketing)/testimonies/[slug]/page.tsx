import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/brand/reveal';
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
          <p className="mt-4 text-muted-foreground">
            By {testimony.author.displayName}
          </p>
          {testimony.publishedAt && (
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(testimony.publishedAt).toLocaleDateString('en-US', {
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
