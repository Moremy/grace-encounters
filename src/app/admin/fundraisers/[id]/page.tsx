import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { canAdmin, fromPrismaRole } from '@/lib/auth/roles';
import {
  approveFundraiser,
  approvePaymentChannel,
  closeFundraiser,
  markFundraiserUnderReview,
  publishFundraiser,
  rejectFundraiser,
  requestMoreInfoForFundraiser,
  sendFundraiserToTreasury,
  suspendFundraiser,
  updateFundraiserAmountRaised,
} from '@/lib/fundraisers/admin-actions';

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      role: true,
    },
  });

  const role = fromPrismaRole(profile?.role ?? null);

  if (!profile || !canAdmin(role)) {
    redirect('/dashboard');
  }

  return profile;
}

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

export default async function AdminFundraiserDetailPage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const fundraiser = await prisma.fundraiser.findUnique({
    where: {
      id: params.id,
    },
    include: {
      paymentChannels: true,
      media: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      documents: {
        orderBy: {
          createdAt: 'desc',
        },
      },
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
          Math.round((Number(fundraiser.amountRaised) / Number(fundraiser.targetAmount)) * 100),
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">
            Fundraiser Review
          </p>

          <h1 className="mt-2 font-serif text-3xl font-bold text-navy">{fundraiser.title}</h1>

          <p className="mt-2 text-muted-foreground">
            Review fundraiser details, beneficiary information, payment channels, supporting files,
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
          <p className="mt-2 text-xl font-bold text-navy">{formatStatus(fundraiser.status)}</p>
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
        <h2 className="font-serif text-2xl font-semibold text-navy">Fundraising Progress</h2>

        <div className="mt-5">
          <div className="h-3 overflow-hidden rounded-full bg-navy/10">
            <div className="h-full rounded-full bg-gold" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{progress}% funded</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">Fundraiser Story</h2>

          <p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">
            {fundraiser.description}
          </p>
        </section>

        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">Review Status</h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium text-navy">{formatStatus(fundraiser.type)}</span>
            </div>

            <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
              <span className="text-muted-foreground">Published</span>
              <span className="font-medium text-navy">{fundraiser.published ? 'Yes' : 'No'}</span>
            </div>

            <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
              <span className="text-muted-foreground">Suspicious Flag</span>
              <span className="font-medium text-navy">
                {fundraiser.suspiciousFlag ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
              <span className="text-muted-foreground">Deadline</span>
              <span className="font-medium text-navy">{formatDate(fundraiser.deadline)}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Submitted</span>
              <span className="font-medium text-navy">{formatDate(fundraiser.submittedAt)}</span>
            </div>
          </div>
        </section>
      </div>

      {fundraiser.moreInfoMessage ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-amber-900">
            Current More Info Request
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-amber-800">
            {fundraiser.moreInfoMessage}
          </p>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">Requester Information</h2>

          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Requester Name</p>
              <p className="font-medium text-navy">{fundraiser.requesterName}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Requester Contact</p>
              <p className="font-medium text-navy">{fundraiser.requesterContact}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">Beneficiary Information</h2>

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
      </div>

      <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          Supporting Documents & Images
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Review documents and images uploaded by the requester before approving or publishing this
          fundraiser.
        </p>

        {fundraiser.documents.length === 0 && fundraiser.media.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-gold/40 bg-ivory p-5 text-sm text-muted-foreground">
            No supporting documents or images have been uploaded yet.
          </div>
        ) : (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-ivory p-5">
              <h3 className="font-semibold text-navy">Documents</h3>

              {fundraiser.documents.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No documents uploaded.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {fundraiser.documents.map((doc) => (
                    <li key={doc.id} className="rounded-lg border border-border/60 bg-white p-4">
                      <p className="text-sm font-semibold text-navy">{doc.fileName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Type: {formatStatus(doc.documentType)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Uploaded: {formatDate(doc.createdAt)}
                      </p>

                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-ivory transition hover:bg-navy/90"
                      >
                        Open Document
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-border/60 bg-ivory p-5">
              <h3 className="font-semibold text-navy">Images</h3>

              {fundraiser.media.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No images uploaded.</p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {fundraiser.media.map((media) => (
                    <div key={media.id} className="rounded-lg border border-border/60 bg-white p-3">
                      <img
                        src={media.fileUrl}
                        alt={media.fileName || 'Fundraiser supporting image'}
                        className="h-40 w-full rounded-lg object-cover"
                      />

                      <p className="mt-3 truncate text-sm font-semibold text-navy">
                        {media.fileName || 'Supporting image'}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Uploaded: {formatDate(media.createdAt)}
                      </p>

                      <a
                        href={media.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex rounded-lg border border-navy/20 px-4 py-2 text-xs font-semibold text-navy transition hover:bg-navy/5"
                      >
                        Open Image
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-2xl font-semibold text-navy">Payment Channels</h2>

        {fundraiser.paymentChannels.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No payment channels were submitted.</p>
        ) : (
          <div className="mt-4 grid gap-4">
            {fundraiser.paymentChannels.map((channel) => (
              <div key={channel.id} className="rounded-xl border border-border/60 bg-ivory p-4">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <p className="font-semibold text-navy">{formatStatus(channel.channelType)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{channel.channelDetails}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        channel.isApproved
                          ? 'w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700'
                          : 'w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700'
                      }
                    >
                      {channel.isApproved ? 'Approved' : 'Pending Review'}
                    </span>

                    {!channel.isApproved ? (
                      <form action={approvePaymentChannel}>
                        <input type="hidden" name="channelId" value={channel.id} />
                        <input type="hidden" name="fundraiserId" value={fundraiser.id} />
                        <button
                          type="submit"
                          className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-ivory transition hover:bg-navy/90"
                        >
                          Approve Channel
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-2xl font-semibold text-navy">Admin Actions</h2>

        <p className="mt-3 text-muted-foreground">
          Move this fundraiser through the verification workflow. Fundraisers do not appear publicly
          until they are published.
        </p>

        <form
          action={requestMoreInfoForFundraiser}
          className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4"
        >
          <input type="hidden" name="fundraiserId" value={fundraiser.id} />

          <label htmlFor="moreInfoMessage" className="text-sm font-semibold text-amber-900">
            Request More Information / Corrections
          </label>

          <textarea
            id="moreInfoMessage"
            name="moreInfoMessage"
            rows={4}
            placeholder="Example: Please upload a school fee structure, official letter, or clearer payment proof."
            defaultValue={fundraiser.moreInfoMessage ?? ''}
            className="mt-3 w-full rounded-lg border border-amber-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
          />

          <button
            type="submit"
            className="mt-3 rounded-lg bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
          >
            Send Request
          </button>
        </form>

        <form
          action={updateFundraiserAmountRaised}
          className="mt-6 rounded-xl border border-gold/20 bg-ivory p-4"
        >
          <input type="hidden" name="fundraiserId" value={fundraiser.id} />

          <label htmlFor="amountRaised" className="text-sm font-semibold text-navy">
            Update Amount Raised
          </label>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              id="amountRaised"
              name="amountRaised"
              type="number"
              min="0"
              step="1"
              defaultValue={Number(fundraiser.amountRaised)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />

            <button
              type="submit"
              className="rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-navy/90"
            >
              Update Raised
            </button>
          </div>
        </form>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <form action={markFundraiserUnderReview}>
            <input type="hidden" name="fundraiserId" value={fundraiser.id} />
            <button
              type="submit"
              className="w-full rounded-lg border border-navy/20 px-4 py-3 text-sm font-semibold text-navy transition hover:bg-navy/5"
            >
              Mark Under Review
            </button>
          </form>

          <form action={sendFundraiserToTreasury}>
            <input type="hidden" name="fundraiserId" value={fundraiser.id} />
            <button
              type="submit"
              className="w-full rounded-lg border border-gold/40 px-4 py-3 text-sm font-semibold text-navy transition hover:bg-gold/10"
            >
              Send to Treasury
            </button>
          </form>

          <form action={approveFundraiser}>
            <input type="hidden" name="fundraiserId" value={fundraiser.id} />
            <button
              type="submit"
              className="w-full rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              Approve
            </button>
          </form>

          <form action={publishFundraiser}>
            <input type="hidden" name="fundraiserId" value={fundraiser.id} />
            <button
              type="submit"
              className="w-full rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-ivory transition hover:bg-navy/90"
            >
              Publish
            </button>
          </form>

          <form action={rejectFundraiser}>
            <input type="hidden" name="fundraiserId" value={fundraiser.id} />
            <button
              type="submit"
              className="w-full rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
            >
              Reject
            </button>
          </form>

          <form action={suspendFundraiser}>
            <input type="hidden" name="fundraiserId" value={fundraiser.id} />
            <button
              type="submit"
              className="w-full rounded-lg border border-amber-200 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
            >
              Suspend
            </button>
          </form>

          <form action={closeFundraiser}>
            <input type="hidden" name="fundraiserId" value={fundraiser.id} />
            <button
              type="submit"
              className="w-full rounded-lg border border-navy/20 px-4 py-3 text-sm font-semibold text-navy transition hover:bg-navy/5"
            >
              Close
            </button>
          </form>
        </div>

        <div className="mt-5 rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm text-navy">
          Payment channels should be approved before publishing the fundraiser.
        </div>
      </section>
    </div>
  );
}
