import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/brand/reveal';

export const metadata: Metadata = {
  title: 'Crusades & Events',
  description:
    'Upcoming crusades, gatherings, and events where the body of Christ comes together in worship and expectation.',
};

type EventItem = {
  name: string;
  date: string;
  location: string;
  description: string;
};

const events: EventItem[] = [
  {
    name: 'Night of Encounter',
    date: 'February 14, 2025',
    location: 'Grace Assembly Hall, Nairobi',
    description:
      'An evening of worship, testimonies, and prayer for healing. Come expecting God to move.',
  },
  {
    name: 'Kingdom Crusade',
    date: 'March 1-3, 2025',
    location: 'Freedom Park, Kampala',
    description:
      'Three days of open-air preaching, worship, and altar calls. Bring your family, bring your neighbor.',
  },
  {
    name: 'Women of Faith Conference',
    date: 'March 22, 2025',
    location: 'Bethel Center, Lagos',
    description:
      'A gathering for women to be refreshed, equipped, and sent. Workshops, worship, and fellowship.',
  },
  {
    name: 'Youth Revival Weekend',
    date: 'April 11-12, 2025',
    location: 'Upper Room Chapel, Accra',
    description:
      'A weekend for young people to encounter the Holy Spirit, hear the Word, and build lasting community.',
  },
];

export default function EventsPage() {
  return (
    <>
      <section className="bg-ivory py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Upcoming Events
          </p>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl text-navy">
            Crusades & Events
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Come and see what God is doing when His people gather in faith and expectation.
          </p>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map(({ name, date, location, description }) => (
                <Card key={name}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <CardDescription>{date}</CardDescription>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{location}</span>
                        </div>
                      </div>
                    </div>
                    <CardTitle className="mt-4">{name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{description}</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href="#">Learn More</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-ivory text-navy text-center py-32">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <span
              aria-hidden="true"
              className="mx-auto mb-8 block h-px w-16 bg-gold"
            />
            <blockquote className="font-serif text-3xl md:text-4xl text-balance text-navy">
              &ldquo;For where two or three gather in my name, there am I with them.&rdquo;
            </blockquote>
            <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
              — Matthew 18:20
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
