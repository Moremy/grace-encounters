import type { Metadata } from 'next';
import Link from 'next/link';

import { Reveal } from '@/components/brand/reveal';
import { Button } from '@/components/ui/button';
import { GivingHistory } from '@/components/donation/giving-history';
import { getMyDonations, getDonationStats } from '@/lib/donation/actions';

export const metadata: Metadata = {
  title: 'My Giving',
  description: 'View your donation history and manage recurring gifts.',
};

export default async function GivingPage() {
  const [donations, stats] = await Promise.all([
    getMyDonations(),
    getDonationStats(),
  ]);

  const monthlyAverage =
    stats.donationCount > 0
      ? Math.round(stats.totalGiven / 12)
      : 0;

  const recurringDonations = donations.filter((d) => d.recurring);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Reveal>
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl text-navy">My Giving</h1>
          <Button variant="sacred" asChild>
            <Link href="/donate">Make a Donation</Link>
          </Button>
        </div>
      </Reveal>

      {/* Stats Cards */}
      <Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Total Given
            </p>
            <p className="mt-1 text-2xl font-bold text-navy">
              ${stats.totalGiven.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Donations
            </p>
            <p className="mt-1 text-2xl font-bold text-navy">
              {stats.donationCount}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Monthly Average
            </p>
            <p className="mt-1 text-2xl font-bold text-navy">
              ${monthlyAverage.toLocaleString()}
            </p>
          </div>
        </div>
      </Reveal>

      {/* Recurring Donations */}
      {recurringDonations.length > 0 && (
        <Reveal>
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-serif text-lg text-navy mb-4">
              Active Recurring Donations
            </h2>
            <div className="space-y-3">
              {recurringDonations.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-md border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-navy">
                      ${Number(d.amount).toLocaleString()} / {d.recurringInterval}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {d.campaign?.title || 'General Fund'} &middot; {d.provider}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* Giving History */}
      <Reveal>
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-serif text-lg text-navy mb-4">Giving History</h2>
          <GivingHistory
            donations={donations.map((d) => ({
              ...d,
              amount: Number(d.amount),
              createdAt: d.createdAt.toISOString(),
            }))}
          />
        </div>
      </Reveal>
    </div>
  );
}
