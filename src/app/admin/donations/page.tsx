import type { Metadata } from 'next';
import Link from 'next/link';

import { Reveal } from '@/components/brand/reveal';
import { Button } from '@/components/ui/button';
import { getAdminDonationStats, getAllDonationsAdmin } from '@/lib/donation/actions';

export const metadata: Metadata = {
  title: 'Donations Overview - Admin',
  description: 'Manage donations and view giving statistics.',
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    COMPLETED: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    FAILED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        styles[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {status}
    </span>
  );
}

export default async function AdminDonationsPage() {
  const [stats, donations] = await Promise.all([
    getAdminDonationStats(),
    getAllDonationsAdmin(),
  ]);

  const pendingCount = donations.filter((d) => d.status === 'PENDING').length;
  const recentDonations = donations.slice(0, 20);

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl text-navy">Donations Overview</h1>
          <Button variant="sacred" asChild>
            <Link href="/admin/donations/campaigns">Manage Campaigns</Link>
          </Button>
        </div>
      </Reveal>

      {/* Stats Cards */}
      <Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Total Raised
            </p>
            <p className="mt-1 text-2xl font-bold text-navy">
              ${stats.totalRaised.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Total Donors
            </p>
            <p className="mt-1 text-2xl font-bold text-navy">
              {stats.totalDonors}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Active Campaigns
            </p>
            <p className="mt-1 text-2xl font-bold text-navy">
              {stats.campaignsCount}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Pending Donations
            </p>
            <p className="mt-1 text-2xl font-bold text-navy">{pendingCount}</p>
          </div>
        </div>
      </Reveal>

      {/* Recent Donations */}
      <Reveal>
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-serif text-lg text-navy mb-4">
            Recent Donations
          </h2>
          {recentDonations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No donations yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Donor</th>
                    <th className="pb-3 pr-4 font-medium">Amount</th>
                    <th className="pb-3 pr-4 font-medium">Campaign</th>
                    <th className="pb-3 pr-4 font-medium">Provider</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDonations.map((donation) => (
                    <tr key={donation.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 text-navy">
                        {donation.donor?.displayName || 'Anonymous'}
                      </td>
                      <td className="py-3 pr-4 font-medium text-navy">
                        ${Number(donation.amount).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {donation.campaign?.title || 'General'}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {donation.provider}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={donation.status} />
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
