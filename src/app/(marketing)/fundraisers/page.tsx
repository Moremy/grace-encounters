import Link from 'next/link';

export default function FundraisersPage() {
  return (
    <main className="min-h-screen bg-ivory px-6 py-12 text-navy">
      <section className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-2xl border border-gold/20 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">
            Verified Fundraisers
          </p>

          <h1 className="mt-3 font-serif text-4xl font-bold text-navy">
            Support Verified Light and Salt Causes
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            This page will show approved and verified church, ministry, and member
            fundraisers. Each fundraiser will be reviewed before appearing publicly.
          </p>

          <div className="mt-6 rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm text-navy">
            Only support fundraisers marked as verified. Light and Salt reviews
            fundraiser details and payment channels before public display.
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/fundraisers/new"
              className="rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-navy/90"
            >
              Start a Fundraiser
            </Link>

            <Link
              href="/dashboard/fundraisers"
              className="rounded-lg border border-navy/20 px-5 py-3 text-sm font-semibold text-navy transition hover:bg-navy/5"
            >
              My Fundraisers
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-gold/40 bg-white p-8 text-center shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">
            No published fundraisers yet
          </h2>
          <p className="mt-2 text-muted-foreground">
            Approved fundraisers will appear here after admin and treasury review.
          </p>
        </div>
      </section>
    </main>
  );
}
