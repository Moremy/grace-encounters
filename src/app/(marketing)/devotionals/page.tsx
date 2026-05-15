import type { Metadata } from 'next';
import Link from 'next/link';
import { Sun } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/brand/reveal';
import { ScriptureBanner } from '@/components/marketing/scripture-banner';
import { getPublishedDevotionals } from '@/lib/devotional/actions';

export const metadata: Metadata = {
  title: 'Daily Devotionals',
  description:
    'Daily devotional readings from Light and Salt to nourish your spirit and draw you closer to God.',
};

export default async function DevotionalsPage() {
  const devotionals = await getPublishedDevotionals();

  return (
    <>
      <section className="bg-ivory py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Devotionals
          </p>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl text-navy">
            Daily Devotionals
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Nourish your spirit with daily readings rooted in Scripture. Let the Word
            of God guide your steps and renew your mind each day.
          </p>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            {devotionals.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  No devotionals published yet. Check back soon for daily readings.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {devotionals.map((devotional) => (
                  <Card key={devotional.id}>
                    <CardHeader>
                      <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                        <Sun className="h-5 w-5" />
                      </div>
                      <CardDescription className="mt-4">
                        {devotional.scriptureReference}
                      </CardDescription>
                      <CardTitle>{devotional.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {devotional.excerpt}
                      </p>
                      {devotional.publishDate && (
                        <p className="mt-3 text-xs text-muted-foreground">
                          {new Date(devotional.publishDate).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )}
                        </p>
                      )}
                      <Button variant="link" className="mt-4 px-0" asChild>
                        <Link href={`/devotionals/${devotional.slug}`}>
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

      <ScriptureBanner
        scripture="Man shall not live on bread alone, but on every word that comes from the mouth of God."
        reference="Matthew 4:4"
      />
    </>
  );
}
