import * as React from 'react';

export function TestimonialSection() {
  return (
    <section className="relative overflow-hidden bg-burgundy py-24 text-white">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-6 top-10 select-none font-serif text-[10rem] leading-none text-burgundy-400/60 md:text-[14rem]"
      >
        &ldquo;
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-6 select-none font-serif text-[10rem] leading-none text-burgundy-400/60 md:text-[14rem]"
      >
        &rdquo;
      </span>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <blockquote className="font-serif text-2xl italic leading-relaxed text-white md:text-3xl">
          This community gave me a place to be honest about my struggles and to find hope
          again. The truth I encountered here changed the way I live every single day.
        </blockquote>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-teal-200">
          — James T., Community Member
        </p>

        <div className="mt-10 flex items-center justify-center gap-2" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-white" />
          <span className="h-2 w-2 rounded-full bg-white/40" />
          <span className="h-2 w-2 rounded-full bg-white/40" />
        </div>
      </div>
    </section>
  );
}
