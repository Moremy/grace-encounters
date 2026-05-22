import { createFundraiser } from '@/lib/fundraisers/actions';

const fundraiserTypes = [
  { label: 'Medical support', value: 'MEDICAL' },
  { label: 'Funeral support', value: 'FUNERAL' },
  { label: 'Education support', value: 'EDUCATION' },
  { label: 'Church project', value: 'CHURCH_PROJECT' },
  { label: 'Mission trip', value: 'MISSION_TRIP' },
  { label: 'Emergency relief', value: 'EMERGENCY_RELIEF' },
  { label: 'Community aid', value: 'COMMUNITY_AID' },
  { label: 'Other', value: 'OTHER' },
];

const paymentChannels = [
  { label: 'M-Pesa phone number', value: 'MPESA_PHONE' },
  { label: 'M-Pesa till number', value: 'MPESA_TILL' },
  { label: 'Paybill/account number', value: 'PAYBILL' },
  { label: 'PayPal', value: 'PAYPAL' },
  { label: 'Bank account details', value: 'BANK_ACCOUNT' },
  { label: 'Stripe/payment link', value: 'STRIPE' },
  { label: 'Other verified channel', value: 'OTHER' },
];

export default function NewFundraiserPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">
          Verified Fundraiser Request
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-navy">
          Start a Fundraiser
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Submit a fundraiser for review. Fundraisers are not published
          automatically. Admin and treasury approval is required before public
          display.
        </p>
      </div>

      {searchParams?.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {searchParams.error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm text-navy">
        Only verified fundraisers will be published. Payment channels will be
        reviewed before they appear publicly.
      </div>

      <form action={createFundraiser} className="space-y-8">
        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-semibold text-navy">
            Fundraiser Details
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-navy">
                Fundraiser Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="Example: Medical support for..."
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium text-navy">
                Fundraiser Type
              </label>
              <select
                id="type"
                name="type"
                required
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                <option value="">Select type</option>
                {fundraiserTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="targetAmount"
                className="text-sm font-medium text-navy"
              >
                Target Amount
              </label>
              <input
                id="targetAmount"
                name="targetAmount"
                type="number"
                min="1"
                required
                placeholder="Example: 50000"
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="currency" className="text-sm font-medium text-navy">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                defaultValue="KES"
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                <option value="KES">KES</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="deadline" className="text-sm font-medium text-navy">
                Deadline
              </label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-navy"
              >
                Fundraiser Story
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                required
                placeholder="Explain the need, background, and how the support will be used."
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-semibold text-navy">
            Beneficiary & Requester Information
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="beneficiaryName"
                className="text-sm font-medium text-navy"
              >
                Beneficiary Name
              </label>
              <input
                id="beneficiaryName"
                name="beneficiaryName"
                type="text"
                required
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="beneficiaryRelationship"
                className="text-sm font-medium text-navy"
              >
                Relationship to Requester
              </label>
              <input
                id="beneficiaryRelationship"
                name="beneficiaryRelationship"
                type="text"
                required
                placeholder="Example: Self, parent, church member, student"
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="requesterName"
                className="text-sm font-medium text-navy"
              >
                Requester Name
              </label>
              <input
                id="requesterName"
                name="requesterName"
                type="text"
                required
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="requesterContact"
                className="text-sm font-medium text-navy"
              >
                Requester Contact
              </label>
              <input
                id="requesterContact"
                name="requesterContact"
                type="text"
                required
                placeholder="Phone number or email"
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-semibold text-navy">
            Payment Channel for Review
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Add one payment channel for now. More channels will be supported in
            the next phase.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="paymentChannelType"
                className="text-sm font-medium text-navy"
              >
                Payment Channel Type
              </label>
              <select
                id="paymentChannelType"
                name="paymentChannelType"
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                <option value="">Select payment channel</option>
                {paymentChannels.map((channel) => (
                  <option key={channel.value} value={channel.value}>
                    {channel.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="paymentChannelDetails"
                className="text-sm font-medium text-navy"
              >
                Payment Channel Details
              </label>
              <input
                id="paymentChannelDetails"
                name="paymentChannelDetails"
                type="text"
                placeholder="Enter phone, till, paybill, PayPal, bank, or payment link"
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-semibold text-navy">
            Submission Notice
          </h2>

          <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            <p>
              By submitting this fundraiser, you acknowledge that Light and Salt
              will review the details, supporting evidence, beneficiary
              information, and payment channels before publication.
            </p>
            <p>
              Supporting documents and media upload will be connected in the next
              storage phase.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-navy/90"
            >
              Submit for Review
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}