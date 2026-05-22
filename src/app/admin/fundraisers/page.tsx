import Link from 'next/link';

import { prisma } from '@/lib/prisma';

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

export default async function AdminFundraisersPage() {
  const fundraisers = await prisma.fundraiser.findMany({
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
      suspiciousFlag: true,
      requesterName: true,
      requesterContact: true,
      beneficiaryName: true,
      createdAt: true,
      submittedAt: true,
      deadline: true,
    },
  });

  const pendingReviews = fundraisers.filter((fundraiser) =>
    ['SUBMITTED', 'UNDER_REVIEW', 'MORE_INFO_REQUIRED'].includes(
      fundraiser.status,
    ),
  ).length;

  const treasuryQueue = fundraisers.filter(
    (fundraiser) => fundraiser.status === 'TREASURY_REVIEW',
  ).length;

  const published = fundraisers.filter(
    (fundraiser) => fundraiser.status === 'PUBLISHED' || fundraiser.published,
  ).length;

  const totalRaised = fundraisers.reduce(
    (sum, fundraiser) => sum + Number(fundraiser.amountRaised || 0),
    0,
  );

  const flagged = fundraisers.filter(
    (fundraiser) => fundraiser.suspiciousFlag || fundraiser.status === 'SUSPENDED',
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-navy">
          Fundraiser Reviews
        </h1>
        <p className="mt-2 text-muted-foreground">
          Review, approve, publish, reject, suspend, or close submitted
          fundraisers.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Pending Reviews</p>
          <p className="mt-2 text-3xl font-bold text-navy">
            {pendingReviews}
          </p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Treasury Queue</p>
          <p className="mt-2 text-3xl font-bold text-navy">{treasuryQueue}</p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Published</p>
          <p className="mt-2 text-3xl font-bold text-navy">{published}</p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Raised</p>
          <p className="mt-2 text-3xl font-bold text-navy">
            {formatCurrency(totalRaised, 'KES')}
          </p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Flagged</p>
          <p className="mt-2 text-3xl font-bold text-navy">{flagged}</p>
        </div>
      </div>

      {fundraisers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gold/40 bg-white p-8 text-center shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">
            No fundraiser submissions yet
          </h2>
          <p className="mt-2 text-muted-foreground">
            Submitted fundraisers will appear here for admin and treasury review.
          </p>

          <Link
            href="/admin"
            className="mt-6 inline-flex rounded-lg border border-navy/20 px-5 py-3 text-sm font-semibold text-navy transition hover:bg-navy/5"
          >
            Back to Admin Dashboard
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-gold/20 bg-white shadow-sm">
          <div className="border-b border-border/60 p-6">
            <h2 className="font-serif text-2xl font-semibold text-navy">
              Submitted Fundraisers
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Open a fundraiser to review its details, payment channels, and
              verification status.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-ivory text-navy">
                <tr>
                  <th className="px-6 py-4 font-semibold">Fundraiser</th>
                  <th className="px-6 py-4 font-semibold">Requester</th>
                  <th className="px-6 py-4 font-semibold">Beneficiary</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Target</th>
                  <th className="px-6 py-4 font-semibold">Raised</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/60">
                {fundraisers.map((fundraiser) => (
                  <tr key={fundraiser.id} className="align-top">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-navy">
                        {fundraiser.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatStatus(fundraiser.type)}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-navy">
                        {fundraiser.requesterName}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {fundraiser.requesterContact}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-muted-foreground">
                      {fundraiser.beneficiaryName}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span className="w-fit rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
                          {formatStatus(fundraiser.status)}
                        </span>

                        {fundraiser.verified ? (
                          <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Verified
                          </span>
                        ) : (
                          <span className="w-fit rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold text-navy">
                            Awaiting Verification
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium text-navy">
                      {formatCurrency(
                        fundraiser.targetAmount,
                        fundraiser.currency,
                      )}
                    </td>

                    <td className="px-6 py-4 font-medium text-navy">
                      {formatCurrency(
                        fundraiser.amountRaised,
                        fundraiser.currency,
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/fundraisers/${fundraiser.id}`}
                        className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-ivory transition hover:bg-navy/90"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}