import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

// Sample/illustrative copy. These are not real submissions; they exist to
// show how a prayer card will read once the Prayer Wall opens. Each card is
// tagged "Sample" so first-time visitors are not misled into believing the
// preview is live intercession.
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

export function PrayerWallPreview() {
  return (
    <section className="bg-navy text-ivory py-24">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="font-serif text-3xl md:text-4xl text-ivory text-balance">
          Prayer Wall
        </h2>
        <p className="mt-4 max-w-2xl text-ivory/70">
          A gentle place to lay down what is heavy. Read, pray, and quietly stand with one another.
          The first prayers will be shared here soon.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {samplePrayers.map((prayer) => (
            <Card
              key={prayer.id}
              className="bg-navy/40 border-ivory/20 text-ivory"
            >
              <CardContent className="pt-6">
                <span className="inline-block rounded-full border border-ivory/30 px-2 py-0.5 text-[10px] uppercase tracking-widest text-ivory/70">
                  Sample
                </span>
                <p className="mt-3 text-ivory/90 leading-relaxed">{prayer.body}</p>
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

        <p className="mt-8 text-ivory/60 text-sm">
          Names are kept private unless shared.
        </p>
      </div>
    </section>
  );
}
