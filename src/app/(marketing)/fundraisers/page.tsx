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

export default async function FundraisersPage() {
  const fundraisers = await prisma.fundraiser.findMany({
    where: {
      status: 'PUBLISHED',
      verified: true,
      published: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      type: true,
      targetAmount: true,
      amountRaised: true,
      currency: true,
      beneficiaryName: true,
      deadline: true,
      paymentChannels: {
        where: {
          isApproved: true,
        },
        select: {
          id: true,
          channelType: true,
          channelLabel: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-ivory px-6 py-12 text-navy">
      <section className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-2xl border border-gold/20 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">
            Verified Fundraisers
          </p>

          <h1 className="mt-3 font-serif text-4xl font-bold text-navy">
            Support Verified Light Bearers Causes
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            Support approved and verified church, ministry, and member fundraisers. Each fundraiser
            is reviewed before appearing publicly.
          </p>

          <div className="mt-6 rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm text-navy">
            Only support fundraisers marked as verified. Light Bearers reviews fundraiser details
            and payment channels before public display.
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/fundraisers/new"
              className="rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-navy/90"
            >
              Start a Fundraiser
            </Link>
          </div>
        </div>

        {fundraisers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gold/40 bg-white p-8 text-center shadow-sm">
            <h2 className="font-serif text-2xl font-semibold text-navy">
              No published fundraisers yet
            </h2>
            <p className="mt-2 text-muted-foreground">
              Approved fundraisers will appear here after admin and treasury review.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {fundraisers.map((fundraiser) => {
              const progress =
                Number(fundraiser.targetAmount) > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (Number(fundraiser.amountRaised) / Number(fundraiser.targetAmount)) * 100,
                      ),
                    )
                  : 0;

              return (
                <article
                  key={fundraiser.id}
                  className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Verified
                    </span>

                    <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
                      {formatStatus(fundraiser.type)}
                    </span>
                  </div>

                  <h2 className="mt-4 font-serif text-2xl font-semibold text-navy">
                    {fundraiser.title}
                  </h2>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {fundraiser.description}
                  </p>

                  <div className="mt-5 rounded-xl bg-ivory p-4">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Target</p>
                        <p className="font-bold text-navy">
                          {formatCurrency(fundraiser.targetAmount, fundraiser.currency)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Raised</p>
                        <p className="font-bold text-navy">
                          {formatCurrency(fundraiser.amountRaised, fundraiser.currency)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="h-3 overflow-hidden rounded-full bg-navy/10">
                        <div
                          className="h-full rounded-full bg-gold"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{progress}% funded</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                      Beneficiary: {fundraiser.beneficiaryName}
                    </p>

                    <Link
                      href={`/fundraisers/${fundraiser.slug}`}
                      className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-ivory transition hover:bg-navy/90"
                    >
                      View Details
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
