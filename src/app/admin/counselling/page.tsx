import Link from 'next/link';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { canAdmin, fromPrismaRole } from '@/lib/auth/roles';

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true, role: true },
  });

  const role = fromPrismaRole(profile?.role ?? null);

  if (!profile || !canAdmin(role)) {
    redirect('/dashboard');
  }
}

function formatLabel(value: string) {
  return value
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default async function AdminCounsellingPage() {
  await requireAdmin();

  const requests = await prisma.counsellingRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      requester: {
        select: {
          email: true,
          displayName: true,
        },
      },
    },
  });

  const pending = requests.filter((request) => request.status === 'PENDING').length;
  const assigned = requests.filter((request) => request.status === 'ASSIGNED').length;
  const contacted = requests.filter((request) => request.status === 'CONTACTED').length;
  const inProgress = requests.filter((request) => request.status === 'IN_PROGRESS').length;
  const closed = requests.filter((request) => request.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-navy">Counselling Requests</h1>
        <p className="mt-2 text-muted-foreground">
          Review private counselling requests and manage follow-up.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="mt-2 text-3xl font-bold text-navy">{pending}</p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Assigned</p>
          <p className="mt-2 text-3xl font-bold text-navy">{assigned}</p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Contacted</p>
          <p className="mt-2 text-3xl font-bold text-navy">{contacted}</p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="mt-2 text-3xl font-bold text-navy">{inProgress}</p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Closed</p>
          <p className="mt-2 text-3xl font-bold text-navy">{closed}</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gold/40 bg-white p-8 text-center shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">
            No counselling requests yet
          </h2>
          <p className="mt-2 text-muted-foreground">
            Submitted counselling requests will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gold/20 bg-white shadow-sm">
          <div className="border-b border-border/60 p-6">
            <h2 className="font-serif text-2xl font-semibold text-navy">Submitted Requests</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Open a request to review details and update follow-up status.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-ivory text-navy">
                <tr>
                  <th className="px-6 py-4 font-semibold">Requester</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Contact Method</th>
                  <th className="px-6 py-4 font-semibold">Submitted</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/60">
                {requests.map((request) => (
                  <tr key={request.id} className="align-top">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-navy">
                        {request.requester.displayName || 'Unnamed User'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {request.requester.email}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-muted-foreground">
                      {formatLabel(request.category)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="w-fit rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
                        {formatLabel(request.status)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-muted-foreground">
                      {formatLabel(request.contactMethod)}
                    </td>

                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(request.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/counselling/${request.id}`}
                        className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-ivory transition hover:bg-navy/90"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
