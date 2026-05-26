import Link from 'next/link';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

function formatLabel(value: string) {
  return value
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default async function CounsellingPage({
  searchParams,
}: {
  searchParams?: { submitted?: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const requests = await prisma.counsellingRequest.findMany({
    where: {
      requesterId: user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy">Counselling</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Request private counselling support and track the status of your requests.
          </p>
        </div>

        <Link
          href="/dashboard/counselling/new"
          className="rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-navy/90"
        >
          New Counselling Request
        </Link>
      </div>

      {searchParams?.submitted ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Your counselling request was submitted successfully.
        </div>
      ) : null}

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gold/40 bg-white p-8 text-center shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">
            No counselling requests yet
          </h2>
          <p className="mt-2 text-muted-foreground">
            Your private counselling requests and updates will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <article
              key={request.id}
              className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
                      {formatLabel(request.status)}
                    </span>
                    <span className="rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold text-navy">
                      {formatLabel(request.category)}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {request.description}
                  </p>

                  <p className="mt-4 text-xs text-muted-foreground">
                    Submitted: {formatDate(request.createdAt)}
                  </p>
                </div>

                <div className="rounded-xl bg-ivory p-4 text-sm text-navy lg:min-w-64">
                  <p className="text-muted-foreground">Preferred Contact</p>
                  <p className="mt-1 font-semibold">{formatLabel(request.contactMethod)}</p>

                  <p className="mt-4 text-muted-foreground">Contact Details</p>
                  <p className="mt-1 font-semibold">{request.contactDetails}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
