import type { Metadata } from 'next';
import { HandHeart } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getPendingPrayerRequests,
  updatePrayerRequestStatus,
} from '@/lib/prayer/actions';

export const metadata: Metadata = {
  title: 'Moderate Prayer Requests | Admin | Grace Encounters',
  description: 'Review and moderate submitted prayer requests.',
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

export default async function AdminPrayersPage() {
  const requests = await getPendingPrayerRequests();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-navy">
          Moderate Prayer Requests
        </h1>
        <p className="mt-2 text-muted-foreground">
          Approve, reject, or mark prayer requests as answered.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16">
          <HandHeart className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            No prayer requests pending review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0">
                    <HandHeart className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {request.title}
                    </CardTitle>
                    <CardDescription>
                      By {request.author.displayName} &middot; Submitted{' '}
                      {new Date(request.createdAt).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        },
                      )}
                      <span
                        className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${visibilityStyles[request.visibility] ?? ''}`}
                      >
                        {visibilityLabels[request.visibility] ?? request.visibility}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {request.content.slice(0, 300)}
                    {request.content.length > 300 && '...'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
                  <form
                    action={updatePrayerRequestStatus.bind(
                      null,
                      request.id,
                      'APPROVED',
                    )}
                  >
                    <Button type="submit" variant="sacred" size="sm">
                      Approve
                    </Button>
                  </form>

                  <form
                    action={updatePrayerRequestStatus.bind(
                      null,
                      request.id,
                      'REJECTED',
                    )}
                  >
                    <Button type="submit" variant="destructive" size="sm">
                      Reject
                    </Button>
                  </form>

                  <form
                    action={updatePrayerRequestStatus.bind(
                      null,
                      request.id,
                      'ANSWERED',
                    )}
                  >
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="border-gold text-gold hover:bg-gold/10"
                    >
                      Mark Answered
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
