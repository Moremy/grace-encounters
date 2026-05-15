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
import { getMyPrayerRequests } from '@/lib/prayer/actions';

export const metadata: Metadata = {
  title: 'My Prayer Requests | Light and Salt',
  description: 'View and manage your submitted prayer requests.',
};

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-green-100 text-green-800',
  ANSWERED: 'bg-purple-100 text-purple-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  ANSWERED: 'Answered',
  REJECTED: 'Rejected',
};

const visibilityStyles: Record<string, string> = {
  PUBLIC: 'bg-blue-100 text-blue-800',
  ANONYMOUS: 'bg-gray-100 text-gray-800',
  PRIVATE: 'bg-slate-100 text-slate-800',
};

const visibilityLabels: Record<string, string> = {
  PUBLIC: 'Public',
  ANONYMOUS: 'Anonymous',
  PRIVATE: 'Private',
};

export default async function MyPrayerRequestsPage() {
  const prayers = await getMyPrayerRequests();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-navy">
            My Prayer Requests
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track the status of your submitted prayer requests.
          </p>
        </div>
        <Button variant="sacred" asChild>
          <Link href="/prayer-wall/new">
            <Plus className="mr-2 h-4 w-4" />
            New Prayer Request
          </Link>
        </Button>
      </div>

      {prayers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            You have not submitted any prayer requests yet. Share what is on your
            heart and let others stand with you.
          </p>
          <Button variant="sacred" className="mt-6" asChild>
            <Link href="/prayer-wall/new">Submit Your First Prayer Request</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {prayers.map((prayer) => (
            <Card key={prayer.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{prayer.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${visibilityStyles[prayer.visibility] ?? ''}`}
                    >
                      {visibilityLabels[prayer.visibility] ?? prayer.visibility}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[prayer.status] ?? ''}`}
                    >
                      {statusLabels[prayer.status] ?? prayer.status}
                    </span>
                  </div>
                </div>
                <CardDescription>
                  Submitted on{' '}
                  {new Date(prayer.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {prayer.content}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {prayer.prayerCount}{' '}
                  {prayer.prayerCount === 1 ? 'person has' : 'people have'}{' '}
                  prayed for this
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
