import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getMyTestimonies } from '@/lib/testimony/actions';

export const metadata: Metadata = {
  title: 'My Testimonies | Light and Salt',
  description: 'View and manage your submitted testimonies.',
};

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  NEEDS_REVISION: 'bg-orange-100 text-orange-800',
  FEATURED: 'bg-purple-100 text-purple-800',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  NEEDS_REVISION: 'Needs Revision',
  FEATURED: 'Featured',
};

export default async function MyTestimoniesPage() {
  const testimonies = await getMyTestimonies();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-navy">
            My Testimonies
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track the status of your submitted testimonies.
          </p>
        </div>
        <Button variant="sacred" asChild>
          <Link href="/testimonies/new">
            <Plus className="mr-2 h-4 w-4" />
            Share New Testimony
          </Link>
        </Button>
      </div>

      {testimonies.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            You have not shared any testimonies yet. Your story matters - share how
            God has moved in your life.
          </p>
          <Button variant="sacred" className="mt-6" asChild>
            <Link href="/testimonies/new">Share Your First Testimony</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {testimonies.map((testimony) => (
            <Card key={testimony.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{testimony.title}</CardTitle>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[testimony.status] ?? ''}`}
                  >
                    {statusLabels[testimony.status] ?? testimony.status}
                  </span>
                </div>
                <CardDescription>
                  Submitted on{' '}
                  {new Date(testimony.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {testimony.excerpt}
                </p>
                {testimony.revisionNote && (
                  <div className="mt-4 bg-muted p-3 rounded-md text-sm">
                    <p className="font-medium text-foreground">
                      Reviewer Note:
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {testimony.revisionNote}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
