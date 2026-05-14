import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

const prayers: string[] = [
  'Praying for peace in our home, and for patience as we walk through a difficult season together.',
  'Asking the Lord for healing for my mother. May His comfort be near to her this week.',
  'For wisdom at work and a soft heart toward the people I serve. Lord, lead me gently.',
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
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {prayers.map((prayer, idx) => (
            <Card
              key={idx}
              className="bg-navy/40 border-ivory/20 text-ivory"
            >
              <CardContent className="pt-6">
                <p className="text-ivory/90 leading-relaxed">{prayer}</p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="border-ivory/40 text-ivory hover:bg-ivory/10"
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
