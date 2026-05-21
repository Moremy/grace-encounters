import Link from 'next/link';

export default function AdminFundraiserDetailPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-navy">
          Fundraiser Review Details
        </h1>
        <p className="mt-2 text-muted-foreground">
          Admin review actions, payment channel checks, notes, and audit history
          will appear here.
        </p>
      </div>

      <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold text-navy">
          Review Workflow Coming Soon
        </h2>

        <p className="mt-3 text-muted-foreground">
          This page will support requesting more information, treasury review,
          approval, publishing, rejection, suspension, closure, and accountability
          reporting.
        </p>

        <Link
          href="/admin/fundraisers"
          className="mt-6 inline-flex rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-navy/90"
        >
          Back to Fundraiser Reviews
        </Link>
      </div>
    </div>
  );
}
