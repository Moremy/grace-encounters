import * as React from 'react';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Users — Admin' };

export default async function AdminUsersPage() {
  const users = await prisma.profile.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      displayName: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-burgundy">Users</h1>
        <p className="text-sm text-muted-foreground">
          All registered members — {users.length} total
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">
                  {user.displayName ?? '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user.email ?? '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      user.role === 'ADMIN'
                        ? 'bg-burgundy/10 text-burgundy'
                        : user.role === 'MODERATOR'
                          ? 'bg-teal/10 text-teal'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {user.role ?? 'USER'}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}