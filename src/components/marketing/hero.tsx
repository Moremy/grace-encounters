import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/brand/reveal';

export function Hero() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-ivory">
      <div
        aria-hidden="true"
        className="gradient-radial-gold pointer-events-none absolute inset-0"
      />
      <div className="relative max-w-3xl mx-auto px-6 py-32 text-center">
        <Reveal>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Grace Encounters
          </p>
          <h1 className="mt-6 font-serif text-balance text-5xl md:text-7xl text-navy">
            Where Heaven Meets Story.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-foreground/80">
            Real encounters with Jesus. Shared in reverence. Held in prayer.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button variant="sacred" size="lg">
              Share Your Testimony
            </Button>
            <Button variant="outline" size="lg">
              Read Testimonies
            </Button>
          </div>
          <div className="mt-14 text-muted-foreground">
            <p className="font-serif italic text-base md:text-lg">
              Then they overcame him by the blood of the Lamb and by the word of their testimony.
            </p>
            <p className="mt-2 font-serif text-sm">— Revelation 12:11</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
