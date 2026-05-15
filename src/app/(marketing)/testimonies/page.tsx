import type { Metadata } from 'next';
import Link from 'next/link';
import { BookHeart } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/brand/reveal';
import { getApprovedTestimonies } from '@/lib/testimony/actions';

export const metadata: Metadata = {
  title: 'Testimonies',
  description:
    'Stories of grace, healing, and transformation from the Grace Encounters community.',
};

export default async function TestimoniesPage() {
  const testimonies = await getApprovedTestimonies();

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
          <Reveal>
            {testimonies.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  No testimonies yet. Be the first to share what God has done in your
                  life.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonies.map((testimony) => (
                  <Card key={testimony.id}>
                    <CardHeader>
                      <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                        <BookHeart className="h-5 w-5" />
                      </div>
                      <CardDescription className="mt-4">
                        {testimony.author.displayName}
                      </CardDescription>
                      <CardTitle>{testimony.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {testimony.excerpt}
                      </p>
                      <Button variant="link" className="mt-4 px-0" asChild>
                        <Link href={`/testimonies/${testimony.slug}`}>
                          Read More
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
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
