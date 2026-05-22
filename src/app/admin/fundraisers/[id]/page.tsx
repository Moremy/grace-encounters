import Link from 'next/link';
import { notFound } from 'next/navigation';

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

function formatDate(date: Date | null) {
  if (!date) return 'Not set';

  return new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default async function AdminFundraiserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const fundraiser = await prisma.fundraiser.findUnique({
    where: {
      id: params.id,
    },
    include: {
      paymentChannels: true,
      media: true,
      documents: true,
      updates: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      reports: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      auditLogs: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!fundraiser) {
    notFound();
  }

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
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">
            Fundraiser Review
          </p>

          <h1 className="mt-2 font-serif text-3xl font-bold text-navy">
            {fundraiser.title}
          </h1>

          <p className="mt-2 text-muted-foreground">
            Review fundraiser details, beneficiary information, payment channels,
            and verification status.
          </p>
        </div>

        <Link
          href="/admin/fundraisers"
          className="rounded-lg border border-navy/20 px-5 py-3 text-sm font-semibold text-navy transition hover:bg-navy/5"
        >
          Back to Fundraiser Reviews
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-gold/20 bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="mt-2 text-xl font-bold text-navy">
            {formatStatus(fundraiser.status)}
          </p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Target</p>
          <p className="mt-2 text-xl font-bold text-navy">
            {formatCurrency(fundraiser.targetAmount, fundraiser.currency)}
          </p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Raised</p>
          <p className="mt-2 text-xl font-bold text-navy">
            {formatCurrency(fundraiser.amountRaised, fundraiser.currency)}
          </p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Verification</p>
          <p className="mt-2 text-xl font-bold text-navy">
            {fundraiser.verified ? 'Verified' : 'Pending'}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          Fundraising Progress
        </h2>

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
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">
            Fundraiser Story
          </h2>

          <p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">
            {fundraiser.description}
          </p>
        </section>

        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">
            Review Status
          </h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium text-navy">
                {formatStatus(fundraiser.type)}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
              <span className="text-muted-foreground">Published</span>
              <span className="font-medium text-navy">
                {fundraiser.published ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
              <span className="text-muted-foreground">Suspicious Flag</span>
              <span className="font-medium text-navy">
                {fundraiser.suspiciousFlag ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
              <span className="text-muted-foreground">Deadline</span>
              <span className="font-medium text-navy">
                {formatDate(fundraiser.deadline)}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Submitted</span>
              <span className="font-medium text-navy">
                {formatDate(fundraiser.submittedAt)}
              </span>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">
            Requester Information
          </h2>

          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Requester Name</p>
              <p className="font-medium text-navy">{fundraiser.requesterName}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Requester Contact</p>
              <p className="font-medium text-navy">
                {fundraiser.requesterContact}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">
            Beneficiary Information
          </h2>

          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Beneficiary Name</p>
              <p className="font-medium text-navy">
                {fundraiser.beneficiaryName}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Relationship to Requester</p>
              <p className="font-medium text-navy">
                {fundraiser.beneficiaryRelationship}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          Payment Channels
        </h2>

        {fundraiser.paymentChannels.length === 0 ? (
          <p className="mt-4 text-muted-foreground">
            No payment channels were submitted.
          </p>
        ) : (
          <div className="mt-4 grid gap-4">
            {fundraiser.paymentChannels.map((channel) => (
              <div
                key={channel.id}
                className="rounded-xl border border-border/60 bg-ivory p-4"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <p className="font-semibold text-navy">
                      {formatStatus(channel.channelType)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {channel.channelDetails}
                    </p>
                  </div>

                  <span
                    className={
                      channel.isApproved
                        ? 'w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700'
                        : 'w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700'
                    }
                  >
                    {channel.isApproved ? 'Approved' : 'Pending Review'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          Admin Actions Coming Next
        </h2>

        <p className="mt-3 text-muted-foreground">
          In the next phase, this page will support approving, sending to
          treasury review, requesting more information, rejecting, suspending,
          publishing, closing, and updating amount raised.
        </p>
      </section>
    </div>
  );
}