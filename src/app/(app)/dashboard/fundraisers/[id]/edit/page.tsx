import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FundraiserPaymentChannelType, FundraiserType } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { resubmitFundraiser } from '@/lib/fundraisers/actions';

function formatLabel(value: string) {
  return value
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDateForInput(date: Date | null) {
  if (!date) return '';

  return date.toISOString().split('T')[0];
}

export default async function EditFundraiserPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const fundraiser = await prisma.fundraiser.findFirst({
    where: {
      id: params.id,
      requesterId: user.id,
    },
    include: {
      paymentChannels: {
        orderBy: {
          createdAt: 'asc',
        },
        take: 1,
      },
      documents: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      media: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!fundraiser) {
    notFound();
  }

  if (fundraiser.status !== 'MORE_INFO_REQUIRED') {
    redirect('/dashboard/fundraisers');
  }

  const paymentChannel = fundraiser.paymentChannels[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">Edit Fundraiser</p>

          <h1 className="mt-2 font-serif text-3xl font-bold text-navy">
            Edit and Resubmit Fundraiser
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            Update the requested information and resubmit your fundraiser for another review.
          </p>
        </div>

        <Link
          href="/dashboard/fundraisers"
          className="rounded-lg border border-navy/20 px-5 py-3 text-sm font-semibold text-navy transition hover:bg-navy/5"
        >
          Back to My Fundraisers
        </Link>
      </div>

      {fundraiser.moreInfoMessage ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-amber-900">Correction Requested</h2>

          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-amber-800">
            {fundraiser.moreInfoMessage}
          </p>
        </section>
      ) : null}

      <form action={resubmitFundraiser} className="space-y-6">
        <input type="hidden" name="fundraiserId" value={fundraiser.id} />

        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">Fundraiser Details</h2>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div>
              <label htmlFor="title" className="text-sm font-semibold text-navy">
                Fundraiser Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={fundraiser.title}
                className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div>
              <label htmlFor="type" className="text-sm font-semibold text-navy">
                Fundraiser Type
              </label>
              <select
                id="type"
                name="type"
                required
                defaultValue={fundraiser.type}
                className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                {Object.values(FundraiserType).map((type) => (
                  <option key={type} value={type}>
                    {formatLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="targetAmount" className="text-sm font-semibold text-navy">
                Target Amount
              </label>
              <input
                id="targetAmount"
                name="targetAmount"
                type="number"
                min="1"
                step="1"
                required
                defaultValue={Number(fundraiser.targetAmount)}
                className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div>
              <label htmlFor="currency" className="text-sm font-semibold text-navy">
                Currency
              </label>
              <input
                id="currency"
                name="currency"
                type="text"
                required
                defaultValue={fundraiser.currency}
                className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div>
              <label htmlFor="deadline" className="text-sm font-semibold text-navy">
                Deadline
              </label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                defaultValue={formatDateForInput(fundraiser.deadline)}
                className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="description" className="text-sm font-semibold text-navy">
                Fundraiser Story
              </label>
              <textarea
                id="description"
                name="description"
                rows={8}
                required
                defaultValue={fundraiser.description}
                className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">
            Beneficiary & Requester Information
          </h2>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div>
              <label htmlFor="beneficiaryName" className="text-sm font-semibold text-navy">
                Beneficiary Name
              </label>
              <input
                id="beneficiaryName"
                name="beneficiaryName"
                type="text"
                required
                defaultValue={fundraiser.beneficiaryName}
                className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div>
              <label htmlFor="beneficiaryRelationship" className="text-sm font-semibold text-navy">
                Relationship to Requester
              </label>
              <input
                id="beneficiaryRelationship"
                name="beneficiaryRelationship"
                type="text"
                required
                defaultValue={fundraiser.beneficiaryRelationship}
                className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div>
              <label htmlFor="requesterName" className="text-sm font-semibold text-navy">
                Requester Name
              </label>
              <input
                id="requesterName"
                name="requesterName"
                type="text"
                required
                defaultValue={fundraiser.requesterName}
                className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div>
              <label htmlFor="requesterContact" className="text-sm font-semibold text-navy">
                Requester Contact
              </label>
              <input
                id="requesterContact"
                name="requesterContact"
                type="text"
                required
                defaultValue={fundraiser.requesterContact}
                className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">
            Supporting Documents & Images
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Upload requested documents such as school fee structures, letters, receipts, proof
            documents, or supporting images.
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div>
              <label htmlFor="supportingDocuments" className="text-sm font-semibold text-navy">
                Supporting Documents
              </label>
              <input
                id="supportingDocuments"
                name="supportingDocuments"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                className="mt-2 w-full rounded-lg border border-dashed border-gold/40 bg-ivory px-4 py-3 text-sm"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Accepted: PDF, Word, JPG, PNG, WebP. Maximum 10MB per document.
              </p>
            </div>

            <div>
              <label htmlFor="images" className="text-sm font-semibold text-navy">
                Supporting Images
              </label>
              <input
                id="images"
                name="images"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="mt-2 w-full rounded-lg border border-dashed border-gold/40 bg-ivory px-4 py-3 text-sm"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Accepted: JPG, PNG, WebP. Maximum 5MB per image.
              </p>
            </div>
          </div>

          {fundraiser.documents.length > 0 || fundraiser.media.length > 0 ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-ivory p-4">
                <h3 className="font-semibold text-navy">Uploaded Documents</h3>

                {fundraiser.documents.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">No documents uploaded yet.</p>
                ) : (
                  <ul className="mt-3 space-y-2 text-sm">
                    {fundraiser.documents.map((document) => (
                      <li key={document.id}>
                        <a
                          href={document.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-navy underline"
                        >
                          {document.fileName}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-xl border border-border/60 bg-ivory p-4">
                <h3 className="font-semibold text-navy">Uploaded Images</h3>

                {fundraiser.media.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">No images uploaded yet.</p>
                ) : (
                  <ul className="mt-3 space-y-2 text-sm">
                    {fundraiser.media.map((media) => (
                      <li key={media.id}>
                        <a
                          href={media.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-navy underline"
                        >
                          {media.fileName || 'View image'}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">Payment Channel</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Payment channels will be reviewed again after resubmission.
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div>
              <label htmlFor="paymentChannelType" className="text-sm font-semibold text-navy">
                Payment Channel Type
              </label>
              <select
                id="paymentChannelType"
                name="paymentChannelType"
                defaultValue={paymentChannel?.channelType ?? ''}
                className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                <option value="">Select payment channel</option>
                {Object.values(FundraiserPaymentChannelType).map((type) => (
                  <option key={type} value={type}>
                    {formatLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="paymentChannelDetails" className="text-sm font-semibold text-navy">
                Payment Channel Details
              </label>
              <input
                id="paymentChannelDetails"
                name="paymentChannelDetails"
                type="text"
                defaultValue={paymentChannel?.channelDetails ?? ''}
                placeholder="Example: Mpesa number, paybill, till, or bank details"
                className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-ivory transition hover:bg-navy/90"
          >
            Resubmit Fundraiser
          </button>

          <Link
            href="/dashboard/fundraisers"
            className="rounded-lg border border-navy/20 px-6 py-3 text-sm font-semibold text-navy transition hover:bg-navy/5"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
