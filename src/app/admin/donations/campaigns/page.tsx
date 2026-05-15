import type { Metadata } from 'next';
import Link from 'next/link';

import { Reveal } from '@/components/brand/reveal';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { toggleCampaignActive } from '@/lib/donation/actions';

export const metadata: Metadata = {
  title: 'Manage Campaigns - Admin',
  description: 'Create and manage donation campaigns.',
};

export default async function AdminCampaignsPage() {
  const campaigns = await prisma.donationCampaign.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl text-navy">Manage Campaigns</h1>
          <Button variant="sacred" asChild>
            <Link href="/admin/donations/campaigns/new">Create Campaign</Link>
          </Button>
        </div>
      </Reveal>

      <Reveal>
        {campaigns.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No campaigns yet.</p>
            <Button variant="sacred" size="sm" asChild className="mt-4">
              <Link href="/admin/donations/campaigns/new">Create Your First Campaign</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Goal</th>
                  <th className="p-4 font-medium">Progress</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const goal = Number(campaign.goalAmount);
                  const current = Number(campaign.currentAmount);
                  const percentage =
                    goal > 0
                      ? Math.min(Math.round((current / goal) * 100), 100)
                      : 0;

                  return (
                    <tr key={campaign.id} className="border-b last:border-0">
                      <td className="p-4 font-medium text-navy">
                        {campaign.title}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        ${goal.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-gold"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <form action={toggleCampaignActive.bind(null, campaign.id)}>
                          <button
                            type="submit"
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              campaign.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {campaign.active ? 'Active' : 'Inactive'}
                          </button>
                        </form>
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/donate/${campaign.slug}`}
                          className="text-xs text-gold hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Reveal>
    </div>
  );
}
