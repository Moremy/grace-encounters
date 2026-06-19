import * as React from 'react';
import { Building2, Users, Globe } from 'lucide-react';

import { Reveal } from '@/components/brand/reveal';

type Stat = {
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const stats: Stat[] = [
  {
    title: 'Building Stronger Lives',
    description: 'Discipleship and teaching that ground people in lasting truth.',
    Icon: Building2,
  },
  {
    title: 'Transforming Communities',
    description: 'Outreach that meets real needs and restores hope close to home.',
    Icon: Users,
  },
  {
    title: 'Bringing Light to the World',
    description: 'Carrying the message of truth far beyond our own doorstep.',
    Icon: Globe,
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
              Light Bearers gathers testimonies, prayer, and devotion into one reverent
              space. We exist to shine truth into everyday life and to walk alongside
              people as God transforms them — built slowly, kept gently, and held in the
              hands of the One who began it.
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
