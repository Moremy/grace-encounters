import * as React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canAdmin, fromPrismaRole } from '@/lib/auth/roles';
import { ScrollText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AuditAction } from '@/lib/security/audit-log';

interface PageProps {
  searchParams: {
    page?: string;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  };
}

export default async function AuditLogPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!canAdmin(fromPrismaRole(profile?.role))) {
    redirect('/dashboard');
  }

  const params = searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const pageSize = 25;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (params.userId) {
    where.userId = params.userId;
  }
  if (params.action) {
    where.action = params.action;
  }
  if (params.startDate || params.endDate) {
    where.createdAt = {
      ...(params.startDate ? { gte: new Date(params.startDate) } : {}),
      ...(params.endDate ? { lte: new Date(params.endDate) } : {}),
    };
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        user: {
          select: { displayName: true, email: true },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  const auditActions: AuditAction[] = [
    'USER_LOGIN',
    'USER_LOGOUT',
    'CONTENT_CREATE',
    'CONTENT_UPDATE',
    'CONTENT_DELETE',
    'CONTENT_APPROVE',
    'CONTENT_REJECT',
    'DONATION_CREATED',
    'SETTINGS_CHANGED',
    'ADMIN_ACTION',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ScrollText className="h-6 w-6 text-navy" />
        <h1 className="font-serif text-2xl font-bold text-navy">Audit Log</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form method="get" className="flex flex-wrap gap-4">
            <select
              name="action"
              defaultValue={params.action ?? ''}
              className="rounded-md border border-border px-3 py-2 text-sm"
            >
              <option value="">All Actions</option>
              {auditActions.map((action) => (
                <option key={action} value={action}>
                  {action.replace(/_/g, ' ')}
                </option>
              ))}
            </select>

            <input
              type="date"
              name="startDate"
              defaultValue={params.startDate ?? ''}
              placeholder="Start date"
              className="rounded-md border border-border px-3 py-2 text-sm"
            />

            <input
              type="date"
              name="endDate"
              defaultValue={params.endDate ?? ''}
              placeholder="End date"
              className="rounded-md border border-border px-3 py-2 text-sm"
            />

            <button
              type="submit"
              className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-ivory transition-colors hover:bg-navy/90"
            >
              Filter
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Log Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Log Entries ({total} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No audit log entries found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Time
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      User
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Action
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Resource
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b last:border-b-0">
                      <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        {log.user?.displayName ?? log.user?.email ?? 'System'}
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-block rounded bg-navy/10 px-2 py-0.5 text-xs font-medium text-navy">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {log.resource}
                        {log.resourceId && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({log.resourceId})
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {log.ipAddress ?? '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <a
                    href={`/admin/audit-log?page=${page - 1}${params.action ? `&action=${params.action}` : ''}${params.startDate ? `&startDate=${params.startDate}` : ''}${params.endDate ? `&endDate=${params.endDate}` : ''}`}
                    className="rounded-md border px-3 py-1 text-sm hover:bg-accent"
                  >
                    Previous
                  </a>
                )}
                {page < totalPages && (
                  <a
                    href={`/admin/audit-log?page=${page + 1}${params.action ? `&action=${params.action}` : ''}${params.startDate ? `&startDate=${params.startDate}` : ''}${params.endDate ? `&endDate=${params.endDate}` : ''}`}
                    className="rounded-md border px-3 py-1 text-sm hover:bg-accent"
                  >
                    Next
                  </a>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
