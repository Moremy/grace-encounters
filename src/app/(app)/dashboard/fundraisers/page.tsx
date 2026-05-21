import Link from 'next/link';

export default function MyFundraisersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy">
            My Fundraisers
          </h1>
          <p className="mt-2 text-muted-foreground">
            View your submitted fundraisers, review status, and requested
            corrections.
          </p>
        </div>

        <Link
          href="/fundraisers/new"
          className="rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-navy/90"
        >
          Create New Fundraiser
        </Link>
      </div>

      <div className="rounded-2xl border border-dashed border-gold/40 bg-white p-8 text-center shadow-sm">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          No submitted fundraisers yet
        </h2>
        <p className="mt-2 text-muted-foreground">
          Your fundraiser submissions and review statuses will appear here.
        </p>
      </div>
    </div>
  );
}
