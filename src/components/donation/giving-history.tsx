import * as React from 'react';

interface DonationRecord {
  id: string;
  amount: number | { toString(): string };
  currency: string;
  provider: string;
  status: string;
  createdAt: Date | string;
  campaign?: { title: string } | null;
}

interface GivingHistoryProps {
  donations: DonationRecord[];
}

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

export function GivingHistory({ donations }: GivingHistoryProps) {
  if (donations.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          No donations yet. Your giving history will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-3 pr-4 font-medium">Date</th>
            <th className="pb-3 pr-4 font-medium">Amount</th>
            <th className="pb-3 pr-4 font-medium">Campaign</th>
            <th className="pb-3 pr-4 font-medium">Provider</th>
            <th className="pb-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {donations.map((donation) => (
            <tr key={donation.id} className="border-b last:border-0">
              <td className="py-3 pr-4 text-navy">
                {new Date(donation.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3 pr-4 font-medium text-navy">
                ${Number(donation.amount).toLocaleString()}
              </td>
              <td className="py-3 pr-4 text-muted-foreground">
                {donation.campaign?.title || 'General Fund'}
              </td>
              <td className="py-3 pr-4 text-muted-foreground">
                {donation.provider}
              </td>
              <td className="py-3">
                <StatusBadge status={donation.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
