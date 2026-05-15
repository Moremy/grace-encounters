import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/brand/reveal';
import { getArticleBySlug } from '@/lib/blog/actions';

const categoryLabels: Record<string, string> = {
  DEVOTIONAL_THOUGHT: 'Devotional Thought',
  FAITH_LIVING: 'Faith Living',
  TESTIMONY_REFLECTION: 'Testimony Reflection',
  CHURCH_NEWS: 'Church News',
  MISSIONS: 'Missions',
  PRAYER: 'Prayer',
};

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return { title: 'Article Not Found' };
  }

  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <section className="bg-ivory py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block rounded-full bg-gold/15 text-gold px-3 py-1 text-xs font-medium mb-4">
            {categoryLabels[article.category] ?? article.category}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-navy">
            {article.title}
          </h1>
          <p className="mt-4 text-muted-foreground">
            By {article.author.displayName}
          </p>
          {article.publishDate && (
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(article.publishDate).toLocaleDateString('en-US', {
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
            <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-base">
              {article.content}
            </div>
          </Reveal>

          <div className="mt-16">
            <Button variant="outline" asChild>
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
