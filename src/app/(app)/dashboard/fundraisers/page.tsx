import Link from 'next/link';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

function formatCurrency(amount: unknown, currency: string) {
  const numericAmount = Number(amount || 0);

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

function formatStatus(status: string) {
  return status
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function MyFundraisersPage({
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

  const fundraisers = await prisma.fundraiser.findMany({
    where: {
      requesterId: user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      targetAmount: true,
      amountRaised: true,
      currency: true,
      status: true,
      verified: true,
      published: true,
      moreInfoMessage: true,
      createdAt: true,
      submittedAt: true,
      deadline: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy">
            My Fundraisers
          </h1>
          <p className="mt-2 text-muted-foreground">
            View your submitted fundraisers, review status, and requested
            corrections.
          </p>
        </div>

        <Link
          href="/fundraisers/new"
          className="rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-navy/90"
        >
          Create New Fundraiser
        </Link>
      </div>

      {searchParams?.submitted ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          Your fundraiser was submitted successfully and is awaiting review.
        </div>
      ) : null}

      {fundraisers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gold/40 bg-white p-8 text-center shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">
            No submitted fundraisers yet
          </h2>
          <p className="mt-2 text-muted-foreground">
            Your fundraiser submissions and review statuses will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {fundraisers.map((fundraiser) => {
            const progress =
              Number(fundraiser.targetAmount) > 0
                ? Math.min(
                    100,
                    Math.round(
                      (Number(fundraiser.amountRaised) /
                        Number(fundraiser.targetAmount)) *
                        100,
                    ),
                  )
                : 0;

            return (
              <article
                key={fundraiser.id}
                className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
                        {formatStatus(fundraiser.status)}
                      </span>

                      {fundraiser.verified ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Verified
                        </span>
                      ) : (
                        <span className="rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold text-navy">
                          Awaiting Verification
                        </span>
                      )}
                    </div>

                    <h2 className="font-serif text-2xl font-semibold text-navy">
                      {fundraiser.title}
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      Type: {formatStatus(fundraiser.type)}
                    </p>

                    {fundraiser.moreInfoMessage ? (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        Correction requested: {fundraiser.moreInfoMessage}
                      </div>
                    ) : null}
                  </div>

                  <div className="min-w-[220px] rounded-xl bg-ivory p-4">
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="mt-1 text-xl font-bold text-navy">
                      {formatCurrency(
                        fundraiser.targetAmount,
                        fundraiser.currency,
                      )}
                    </p>

                    <p className="mt-3 text-sm text-muted-foreground">
                      Raised
                    </p>
                    <p className="mt-1 text-lg font-semibold text-navy">
                      {formatCurrency(
                        fundraiser.amountRaised,
                        fundraiser.currency,
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="h-3 overflow-hidden rounded-full bg-navy/10">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {progress}% funded
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}