import Link from 'next/link';

export default function FundraiserDetailPage() {
  return (
    <main className="min-h-screen bg-ivory px-6 py-12 text-navy">
      <section className="mx-auto max-w-4xl rounded-2xl border border-gold/20 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">
          Verified Fundraiser
        </p>

        <h1 className="mt-3 font-serif text-4xl font-bold text-navy">
          Fundraiser Details
        </h1>

        <p className="mt-4 leading-7 text-muted-foreground">
          This page will display the fundraiser story, target amount, amount
          raised, deadline, beneficiary details, approved payment channels,
          supporting media, updates, and accountability reports.
        </p>

        <div className="mt-6 rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm text-navy">
          Support only verified fundraisers. Payment channels will be shown only
          after approval.
        </div>

        <Link
          href="/fundraisers"
          className="mt-8 inline-flex rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-navy/90"
        >
          Back to Fundraisers
        </Link>
      </section>
    </main>
  );
}
