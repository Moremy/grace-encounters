import Link from 'next/link';

export default function AdminFundraisersPage() {
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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Pending Reviews</p>
          <p className="mt-2 text-3xl font-bold text-navy">0</p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Treasury Queue</p>
          <p className="mt-2 text-3xl font-bold text-navy">0</p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Published</p>
          <p className="mt-2 text-3xl font-bold text-navy">0</p>
        </div>
      </div>

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
    </div>
  );
}
