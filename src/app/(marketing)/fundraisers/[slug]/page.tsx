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
  }).format(date);
}

export default async function FundraiserDetailPage({ params }: { params: { slug: string } }) {
  const fundraiser = await prisma.fundraiser.findFirst({
    where: {
      slug: params.slug,
      status: 'PUBLISHED',
      verified: true,
      published: true,
    },
    include: {
      paymentChannels: {
        where: {
          isApproved: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      updates: {
        where: {
          isPublic: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      reports: {
        where: {
          isPublic: true,
        },
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
          Math.round((Number(fundraiser.amountRaised) / Number(fundraiser.targetAmount)) * 100),
        )
      : 0;

  return (
    <main className="min-h-screen bg-ivory px-6 py-12 text-navy">
      <section className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-2xl border border-gold/20 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              Verified Fundraiser
            </span>

            <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
              {formatStatus(fundraiser.type)}
            </span>
          </div>

          <h1 className="mt-4 font-serif text-4xl font-bold text-navy">{fundraiser.title}</h1>

          <p className="mt-4 max-w-3xl whitespace-pre-line leading-7 text-muted-foreground">
            {fundraiser.description}
          </p>

          <div className="mt-6 rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm text-navy">
            Support only verified fundraisers. Payment channels are shown only after admin approval.
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-ivory p-5">
              <p className="text-sm text-muted-foreground">Target Amount</p>
              <p className="mt-1 text-2xl font-bold text-navy">
                {formatCurrency(fundraiser.targetAmount, fundraiser.currency)}
              </p>
            </div>

            <div className="rounded-xl bg-ivory p-5">
              <p className="text-sm text-muted-foreground">Amount Raised</p>
              <p className="mt-1 text-2xl font-bold text-navy">
                {formatCurrency(fundraiser.amountRaised, fundraiser.currency)}
              </p>
            </div>

            <div className="rounded-xl bg-ivory p-5">
              <p className="text-sm text-muted-foreground">Deadline</p>
              <p className="mt-1 text-2xl font-bold text-navy">{formatDate(fundraiser.deadline)}</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="h-3 overflow-hidden rounded-full bg-navy/10">
              <div className="h-full rounded-full bg-gold" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{progress}% funded</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold text-navy">Beneficiary</h2>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Beneficiary Name</p>
                <p className="font-medium text-navy">{fundraiser.beneficiaryName}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Relationship to Requester</p>
                <p className="font-medium text-navy">{fundraiser.beneficiaryRelationship}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold text-navy">
              Approved Payment Channels
            </h2>

            {fundraiser.paymentChannels.length === 0 ? (
              <p className="mt-4 text-muted-foreground">
                No approved payment channels are available yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {fundraiser.paymentChannels.map((channel) => (
                  <div key={channel.id} className="rounded-xl border border-border/60 bg-ivory p-4">
                    <p className="font-semibold text-navy">{formatStatus(channel.channelType)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{channel.channelDetails}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">Public Updates</h2>

          {fundraiser.updates.length === 0 ? (
            <p className="mt-4 text-muted-foreground">No public updates have been posted yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {fundraiser.updates.map((update) => (
                <article
                  key={update.id}
                  className="rounded-xl border border-border/60 bg-ivory p-4"
                >
                  <h3 className="font-semibold text-navy">{update.title}</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                    {update.body}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">Accountability Reports</h2>

          {fundraiser.reports.length === 0 ? (
            <p className="mt-4 text-muted-foreground">
              No public accountability reports have been posted yet.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {fundraiser.reports.map((report) => (
                <article
                  key={report.id}
                  className="rounded-xl border border-border/60 bg-ivory p-4"
                >
                  <h3 className="font-semibold text-navy">{report.title}</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                    {report.reportBody}
                  </p>

                  {report.amountAccountedFor ? (
                    <p className="mt-3 text-sm font-medium text-navy">
                      Amount accounted for:{' '}
                      {formatCurrency(report.amountAccountedFor, fundraiser.currency)}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>

        <Link
          href="/fundraisers"
          className="inline-flex rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-navy/90"
        >
          Back to Fundraisers
        </Link>
      </section>
    </main>
  );
}
