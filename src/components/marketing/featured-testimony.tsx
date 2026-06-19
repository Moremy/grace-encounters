import * as React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { getFeaturedTestimonies } from '@/lib/testimony/actions';

export async function FeaturedTestimony() {
  let featured: Awaited<ReturnType<typeof getFeaturedTestimonies>> = [];
  try {
    featured = await getFeaturedTestimonies();
  } catch (error) {
    console.error('[FeaturedTestimony] Failed to fetch featured testimonies:', error);
  }

  const testimony = featured[0] ?? null;

  return (
    <section className="bg-ivory/50 py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="font-serif text-3xl text-burgundy md:text-4xl">
            Testimonies
          </h2>
          <p className="mt-3 text-muted-foreground">
            Stories of God&apos;s faithfulness.
          </p>
        </div>

        {testimony ? (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Featured Testimony
                </p>
                {testimony.category && (
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">
                    {testimony.category.charAt(0) +
                      testimony.category.slice(1).toLowerCase()}
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-serif text-2xl md:text-3xl text-burgundy">
                {testimony.title}
              </h3>
            </CardHeader>
            <CardContent>
              <blockquote className="font-serif text-lg md:text-xl text-navy leading-relaxed">
                {testimony.excerpt}
              </blockquote>
              <p className="mt-4 text-sm text-muted-foreground">
                &mdash;{' '}
                {testimony.isAnonymous
                  ? 'Anonymous'
                  : testimony.author?.displayName ?? 'A friend'}
              </p>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-between gap-3">
              <Button variant="ghost" asChild>
                <Link href={`/testimonies/${testimony.slug}`}>
                  Read this testimony &rarr;
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/testimonies">View all testimonies</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Featured Testimony
                </p>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  Pending review
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <blockquote className="font-serif text-xl md:text-2xl text-navy leading-relaxed">
                First testimonies coming soon. Submissions are read prayerfully and published with care.
              </blockquote>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">Reviewed before publishing.</p>
            </CardFooter>
          </Card>
        )}
      </div>
    </section>
  );
}
