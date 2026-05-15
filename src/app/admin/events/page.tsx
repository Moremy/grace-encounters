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
import { getAllEventsAdmin, updateEventStatus } from '@/lib/event/actions';

export const metadata: Metadata = {
  title: 'Manage Events | Admin | Light and Salt',
  description: 'Create and manage crusades and events.',
};

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  CANCELLED: 'Cancelled',
};

export default async function AdminEventsPage() {
  const events = await getAllEventsAdmin();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-navy">
            Manage Events
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create, publish, and manage crusades and events.
          </p>
        </div>
        <Link href="/admin/events/new">
          <Button variant="sacred">New Event</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            No events yet. Create your first event.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                      <span
                        className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[event.status] ?? ''}`}
                      >
                        {statusLabels[event.status] ?? event.status}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {event.description.slice(0, 200)}
                  {event.description.length > 200 && '...'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t mt-4">
                  {(event.status === 'DRAFT' ||
                    event.status === 'CANCELLED') && (
                    <form
                      action={updateEventStatus.bind(
                        null,
                        event.id,
                        'PUBLISHED',
                      )}
                    >
                      <Button type="submit" variant="sacred" size="sm">
                        Publish
                      </Button>
                    </form>
                  )}

                  {event.status === 'PUBLISHED' && (
                    <form
                      action={updateEventStatus.bind(
                        null,
                        event.id,
                        'CANCELLED',
                      )}
                    >
                      <Button type="submit" variant="outline" size="sm">
                        Cancel
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
