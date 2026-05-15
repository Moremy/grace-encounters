import * as React from 'react';
import { BookHeart, HandHeart, Sun } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Reveal } from '@/components/brand/reveal';

type Pillar = {
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const pillars: Pillar[] = [
  {
    title: 'Testify',
    description:
      'Share what God has done in plain words. Your story makes room for someone else to hope.',
    Icon: BookHeart,
  },
  {
    title: 'Intercede',
    description:
      "Lift one another's burdens with quiet, faithful prayer. No request is too small to bring.",
    Icon: HandHeart,
  },
  {
    title: 'Abide',
    description:
      'Return each day to scripture and stillness. Let the Word steady your heart.',
    Icon: Sun,
  },
];

export function MissionSection() {
  return (
    <section className="bg-background py-24">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="font-serif text-3xl md:text-4xl text-navy">
          A quiet place for sacred work.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Light and Salt gathers testimonies, prayer, and devotion into one reverent
          space. Built slowly, kept gently, and held in the hands of the One who began it.
        </p>

        <Reveal>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map(({ title, description, Icon }) => (
              <Card key={title}>
                <CardHeader>
                  <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-4">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
