import * as React from 'react';
import { Users, BookOpen, Footprints } from 'lucide-react';

import { Reveal } from '@/components/brand/reveal';

type Stat = {
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const stats: Stat[] = [
  {
    title: 'Gather',
    description:
      'Draw people together around prayer, scripture, and shared life — online and in person.',
    Icon: Users,
  },
  {
    title: 'Disciple',
    description:
      'Ground believers in the Word so they come to know and embrace their true identity in Christ.',
    Icon: BookOpen,
  },
  {
    title: 'Walk',
    description:
      'Stand alongside people through prayer, testimony, and truth as God does His slow, good work.',
    Icon: Footprints,
  },
];

export function MissionSection() {
  return (
    <section id="about" className="scroll-mt-20 bg-cream py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -left-3 -top-3 h-24 w-24 rounded bg-burgundy"
            />
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded bg-gray-200" />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
                About Us
              </span>
              <span className="h-px w-12 bg-teal" aria-hidden="true" />
            </div>

            <h2 className="mt-4 font-serif text-3xl text-burgundy md:text-4xl">
              A Mission That Makes a Difference
            </h2>

            <p className="mt-4 max-w-2xl text-muted-foreground">
              To gather, disciple and walk alongside people as they discover and embrace
              their identity in Christ through prayer, testimony and truth.
            </p>
            <p className="mt-3 max-w-2xl text-sm italic text-muted-foreground">
              Inspiring a generation to walk confidently in their identity as the Light of
              the world.
            </p>

            <Reveal>
              <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
                {stats.map(({ title, description, Icon }) => (
                  <div key={title}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-serif text-base font-semibold text-burgundy">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
