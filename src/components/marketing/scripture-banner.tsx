import * as React from 'react';

import { Reveal } from '@/components/brand/reveal';

interface ScriptureBannerProps {
  scripture?: string;
  reference?: string;
}

export function ScriptureBanner({ scripture, reference }: ScriptureBannerProps) {
  const displayScripture = scripture ?? 'He has made everything beautiful in its time.';
  const displayReference = reference ?? 'Ecclesiastes 3:11';

  return (
    <section className="bg-ivory text-navy text-center py-32">
      <div className="max-w-3xl mx-auto px-6">
        <Reveal>
          <span
            aria-hidden="true"
            className="mx-auto mb-8 block h-px w-16 bg-gold"
          />
          <blockquote className="font-serif text-3xl md:text-4xl text-balance text-navy">
            &ldquo;{displayScripture}&rdquo;
          </blockquote>
          <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
            — {displayReference}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
