import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Reveal } from '@/components/brand/reveal';
import { TestimonyCard } from '@/components/testimony/testimony-card';
import { TestimonyFilters } from '@/components/testimony/testimony-filters';
import { getFilteredTestimonies } from '@/lib/testimony/actions';

export const metadata: Metadata = {
  title: 'Testimonies',
  description:
    'Stories of grace, healing, and transformation from the Light Bearers community.',
};

export default async function TestimoniesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const category =
    typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const mediaType =
    typeof searchParams.mediaType === 'string' ? searchParams.mediaType : undefined;

  // Only featured testimonies are visible publicly — getFilteredTestimonies
  // applies that filter at the data layer.
  const testimonies = await getFilteredTestimonies(category, mediaType);

  return (
    <>
      <section className="bg-ivory py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Testimonies
          </p>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl text-navy">
            Stories of Grace
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Real stories from real people whose lives have been touched by the hand of
            God. Be encouraged and give glory to Him.
          </p>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-6xl mx-auto px-6">
          {/* Filters */}
          <div className="mb-8">
            <Suspense fallback={null}>
              <TestimonyFilters />
            </Suspense>
          </div>

          <Reveal>
            {testimonies.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  No featured testimonies yet. Check back soon — stories are
                  prayerfully reviewed before being shared here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonies.map((testimony) => (
                  <TestimonyCard key={testimony.id} testimony={testimony} />
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <section className="bg-ivory text-navy text-center py-32">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <span
              aria-hidden="true"
              className="mx-auto mb-8 block h-px w-16 bg-gold"
            />
            <blockquote className="font-serif text-3xl md:text-4xl text-balance text-navy">
              &ldquo;They triumphed over him by the blood of the Lamb and by the word
              of their testimony.&rdquo;
            </blockquote>
            <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
              — Revelation 12:11
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
