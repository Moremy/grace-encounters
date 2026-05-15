import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/brand/reveal';
import { getEventBySlug } from '@/lib/event/actions';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    return { title: 'Event Not Found' };
  }

  return {
    title: event.title,
    description: event.description.slice(0, 160),
  };
}

export default async function EventDetailPage({ params }: Props) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = new Date(event.date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedEndDate = event.endDate
    ? new Date(event.endDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const formattedEndTime = event.endDate
    ? new Date(event.endDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <>
      <section className="bg-ivory py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {event.featured && (
            <span className="inline-block rounded-full bg-gold/15 text-gold px-3 py-1 text-xs font-medium mb-4">
              Featured
            </span>
          )}
          <h1 className="font-serif text-3xl md:text-4xl text-navy">
            {event.title}
          </h1>
          <div className="mt-4 flex flex-col items-center gap-2 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {formattedDate} at {formattedTime}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            {formattedEndDate && (
              <p className="text-sm text-muted-foreground mb-8">
                <span className="font-medium text-navy">Event period:</span>{' '}
                {formattedDate} at {formattedTime} &ndash; {formattedEndDate} at{' '}
                {formattedEndTime}
              </p>
            )}

            <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {event.description}
            </div>
          </Reveal>

          <div className="mt-16">
            <Button variant="outline" asChild>
              <Link href="/events">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
