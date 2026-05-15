import * as React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { PrayButton } from '@/components/prayer/pray-button';
import { getApprovedPrayerRequests } from '@/lib/prayer/actions';

// Sample/illustrative copy used as fallback when no real prayer requests exist.
const samplePrayers: { id: string; body: string }[] = [
  {
    id: 'sample-1',
    body: 'A short prayer for peace at home will appear here. Names are kept private unless shared.',
  },
  {
    id: 'sample-2',
    body: 'A request for healing or comfort will appear here, written in the words of the person asking.',
  },
  {
    id: 'sample-3',
    body: 'A prayer for wisdom or guidance will appear here. Anyone can quietly stand alongside it.',
  },
];

export async function PrayerWallPreview() {
  const prayers = await getApprovedPrayerRequests();

  return (
    <section className="bg-navy text-ivory py-24">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="font-serif text-3xl md:text-4xl text-ivory text-balance">
          Prayer Wall
        </h2>
        <p className="mt-4 max-w-2xl text-ivory/70">
          A gentle place to lay down what is heavy. Read, pray, and quietly stand with one another.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {prayers.length > 0
            ? prayers.slice(0, 3).map((prayer) => (
                <Card
                  key={prayer.id}
                  className="bg-navy/40 border-ivory/20 text-ivory"
                >
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-ivory">
                      {prayer.title}
                    </p>
                    <p className="mt-2 text-ivory/90 leading-relaxed text-sm">
                      {prayer.content.slice(0, 120)}
                      {prayer.content.length > 120 && '...'}
                    </p>
                    <p className="mt-3 text-xs text-ivory/60">
                      {prayer.visibility === 'ANONYMOUS'
                        ? 'Anonymous'
                        : prayer.author.displayName}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <PrayButton
                      prayerRequestId={prayer.id}
                      initialCount={prayer.prayerCount}
                    />
                  </CardFooter>
                </Card>
              ))
            : samplePrayers.map((prayer) => (
                <Card
                  key={prayer.id}
                  className="bg-navy/40 border-ivory/20 text-ivory"
                >
                  <CardContent className="pt-6">
                    <span className="inline-block rounded-full border border-ivory/30 px-2 py-0.5 text-[10px] uppercase tracking-widest text-ivory/70">
                      Sample
                    </span>
                    <p className="mt-3 text-ivory/90 leading-relaxed">
                      {prayer.body}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="border-ivory/40 text-ivory hover:bg-ivory/10"
                      disabled
                      aria-disabled="true"
                    >
                      I prayed for this
                    </Button>
                  </CardFooter>
                </Card>
              ))}
        </div>

        <div className="mt-8 flex items-center gap-4">
          <p className="text-ivory/60 text-sm">
            Names are kept private unless shared.
          </p>
          <Button variant="outline" className="border-ivory/40 text-ivory hover:bg-ivory/10" asChild>
            <Link href="/prayer-wall">View All Prayers</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
