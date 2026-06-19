import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Globe, MapPin, Newspaper } from 'lucide-react';

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
  title: 'Events, Crusades & Faith News',
  description:
    'Upcoming crusades and gatherings, plus faith news and updates from around the world.',
};

type NewsItem = {
  source: string;
  headline: string;
  date: string;
  excerpt: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const newsItems: NewsItem[] = [
  {
    source: 'Ministry Today',
    headline: 'Revival Services See Record Attendance Across East Africa',
    date: 'January 15, 2025',
    excerpt:
      'Thousands gather for week-long crusade events as communities report renewed hunger for the gospel and miraculous testimonies.',
    Icon: Globe,
  },
  {
    source: 'Faith Wire',
    headline: 'New Bible Translation Reaches Remote Communities',
    date: 'January 10, 2025',
    excerpt:
      'A decade-long translation effort brings the full scripture to three previously unreached language groups.',
    Icon: Newspaper,
  },
  {
    source: 'Christian Post',
    headline: 'Youth Prayer Movement Grows in University Campuses',
    date: 'January 6, 2025',
    excerpt:
      'Student-led prayer gatherings are spreading organically across universities, with reports of healing and renewed faith.',
    Icon: Globe,
  },
  {
    source: 'Gospel Herald',
    headline: 'Churches Unite for City-Wide Day of Fasting and Prayer',
    date: 'December 30, 2024',
    excerpt:
      'Over fifty congregations join together to seek God for their city, setting aside denominational lines for a shared cause.',
    Icon: Newspaper,
  },
  {
    source: 'Missions Network',
    headline: 'Clean Water Project Opens Doors for Gospel in Rural Villages',
    date: 'December 22, 2024',
    excerpt:
      'Practical love meets spiritual hunger as communities receiving wells also welcome the message of living water.',
    Icon: Globe,
  },
  {
    source: 'Faith Daily',
    headline: 'Annual Scripture Reading Plan Reaches One Million Participants',
    date: 'December 18, 2024',
    excerpt:
      'A global reading initiative invites believers to journey through the entire Bible together in community.',
    Icon: Newspaper,
  },
];

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <>
      <section className="bg-ivory py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Events & Updates
          </p>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl text-navy">
            Events, Crusades &amp; Faith News
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Come and see what God is doing when His people gather — and stay up
            to date with stories of His work around the world.
          </p>
        </div>
      </section>

      {/* Upcoming Events */}
      <section id="events" className="scroll-mt-20 bg-background py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10 flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
              Upcoming Events
            </span>
            <span className="h-px w-12 bg-teal" aria-hidden="true" />
          </div>

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

      {/* Faith News */}
      <section id="news" className="scroll-mt-20 bg-ivory/50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10 flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
              Faith News
            </span>
            <span className="h-px w-12 bg-teal" aria-hidden="true" />
          </div>
          <p className="max-w-2xl text-muted-foreground">
            Stories of what God is doing around the world. Good news for those
            who watch and pray.
          </p>

          <Reveal>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsItems.map(({ source, headline, date, excerpt, Icon }) => (
                <Card key={headline}>
                  <CardHeader>
                    <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardDescription className="mt-4">
                      {source} &middot; {date}
                    </CardDescription>
                    <CardTitle>{headline}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{excerpt}</p>
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
