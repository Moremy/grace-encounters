import type { Metadata } from 'next';
import Link from 'next/link';

import { Reveal } from '@/components/brand/reveal';
import { ScriptureBanner } from '@/components/marketing/scripture-banner';
import { ArticleCard } from '@/components/blog/article-card';
import { CategoryFilter } from '@/components/blog/category-filter';
import { getPublishedArticles, getFeaturedArticles } from '@/lib/blog/actions';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Reflections, writings, and devotional thoughts from the Light Bearers community.',
};

const categories = [
  { label: 'Devotional Thought', value: 'DEVOTIONAL_THOUGHT' },
  { label: 'Faith Living', value: 'FAITH_LIVING' },
  { label: 'Testimony Reflection', value: 'TESTIMONY_REFLECTION' },
  { label: 'Church News', value: 'CHURCH_NEWS' },
  { label: 'Missions', value: 'MISSIONS' },
  { label: 'Prayer', value: 'PRAYER' },
];

const categoryLabels: Record<string, string> = {
  DEVOTIONAL_THOUGHT: 'Devotional Thought',
  FAITH_LIVING: 'Faith Living',
  TESTIMONY_REFLECTION: 'Testimony Reflection',
  CHURCH_NEWS: 'Church News',
  MISSIONS: 'Missions',
  PRAYER: 'Prayer',
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const category =
    typeof searchParams.category === 'string'
      ? searchParams.category
      : undefined;

  const [articles, featured] = await Promise.all([
    getPublishedArticles(category),
    getFeaturedArticles(),
  ]);

  return (
    <>
      <section className="bg-ivory py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Blog
          </p>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl text-navy">
            Reflections &amp; Writings
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Thoughtful meditations on scripture, prayer, and the Christian walk.
            Written slowly, offered freely.
          </p>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="bg-background py-12">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="font-serif text-xl text-navy mb-6">Featured</h2>
            <div className="rounded-lg bg-gradient-to-br from-navy-50 to-card p-6 md:p-8">
              <span className="inline-block rounded-full bg-gold/15 text-gold px-2 py-0.5 text-xs font-medium">
                {categoryLabels[featured[0].category] ??
                  featured[0].category}
              </span>
              <h3 className="mt-3 font-serif text-2xl md:text-3xl text-navy">
                <Link
                  href={`/blog/${featured[0].slug}`}
                  className="hover:underline"
                >
                  {featured[0].title}
                </Link>
              </h3>
              <p className="mt-3 text-muted-foreground max-w-2xl">
                {featured[0].excerpt}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                {featured[0].author.displayName}
                {featured[0].publishDate && (
                  <>
                    {' '}
                    &middot;{' '}
                    {new Date(
                      featured[0].publishDate,
                    ).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </>
                )}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="bg-background py-12">
        <div className="max-w-6xl mx-auto px-6">
          <CategoryFilter categories={categories} activeCategory={category} />
        </div>
      </section>

      <section className="bg-background py-12">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            {articles.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  No articles published yet. Check back soon.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <ScriptureBanner
        scripture="Your word is a lamp for my feet, a light on my path."
        reference="Psalm 119:105"
      />
    </>
  );
}
