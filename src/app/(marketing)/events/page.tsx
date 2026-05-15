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
import { getUpcomingEvents } from '@/lib/event/actions';

export const metadata: Metadata = {
  title: 'Crusades & Events',
  description:
    'Upcoming crusades, gatherings, and events where the body of Christ comes together in worship and expectation.',
};

export default async function EventsPage() {
  const events = await getUpcomingEvents();

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
            Come and see what God is doing when His people gather in faith and
            expectation.
          </p>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            {events.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  No upcoming events. Stay rooted, stay expectant.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <CardDescription>
                            {new Date(event.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </CardDescription>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <CardTitle>{event.title}</CardTitle>
                        {event.featured && (
                          <span className="rounded-full bg-gold/15 text-gold px-3 py-1 text-xs font-medium">
                            Featured
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {event.description.slice(0, 150)}
                        {event.description.length > 150 && '...'}
                      </p>
                      <Button variant="outline" className="mt-4" asChild>
                        <Link href={`/events/${event.slug}`}>Learn More</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
              &ldquo;For where two or three gather in my name, there am I with
              them.&rdquo;
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
