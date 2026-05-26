import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { canAdmin, fromPrismaRole } from '@/lib/auth/roles';
import {
  assignCounsellingRequest,
  closeCounsellingRequest,
  markCounsellingContacted,
  markCounsellingInProgress,
  saveCounsellingAdminNotes,
} from '@/lib/counselling/admin-actions';

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

function formatDate(date: Date | null) {
  if (!date) return 'Not set';

  return new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default async function AdminCounsellingDetailPage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const request = await prisma.counsellingRequest.findUnique({
    where: {
      id: params.id,
    },
    include: {
      requester: {
        select: {
          email: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!request) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">
            Counselling Review
          </p>

          <h1 className="mt-2 font-serif text-3xl font-bold text-navy">
            {formatLabel(request.category)}
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            Review this private counselling request and manage follow-up status.
          </p>
        </div>

        <Link
          href="/admin/counselling"
          className="rounded-lg border border-navy/20 px-5 py-3 text-sm font-semibold text-navy transition hover:bg-navy/5"
        >
          Back to Counselling Requests
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-gold/20 bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="mt-2 text-xl font-bold text-navy">{formatLabel(request.status)}</p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Category</p>
          <p className="mt-2 text-xl font-bold text-navy">{formatLabel(request.category)}</p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Contact Method</p>
          <p className="mt-2 text-xl font-bold text-navy">{formatLabel(request.contactMethod)}</p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Submitted</p>
          <p className="mt-2 text-xl font-bold text-navy">{formatDate(request.createdAt)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">Requester Information</h2>

          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-semibold text-navy">
                {request.requester.displayName || 'Unnamed User'}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Account Email</p>
              <p className="font-semibold text-navy">{request.requester.email}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Preferred Contact</p>
              <p className="font-semibold text-navy">{formatLabel(request.contactMethod)}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Contact Details</p>
              <p className="font-semibold text-navy">{request.contactDetails}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-navy">Timeline</h2>

          <div className="mt-4 space-y-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
              <span className="text-muted-foreground">Submitted</span>
              <span className="font-medium text-navy">{formatDate(request.createdAt)}</span>
            </div>

            <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-medium text-navy">{formatDate(request.updatedAt)}</span>
            </div>

            <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
              <span className="text-muted-foreground">Contacted</span>
              <span className="font-medium text-navy">{formatDate(request.contactedAt)}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Closed</span>
              <span className="font-medium text-navy">{formatDate(request.closedAt)}</span>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-2xl font-semibold text-navy">Counselling Request</h2>

        <p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">
          {request.description}
        </p>
      </section>

      <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-2xl font-semibold text-navy">Admin Management</h2>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form
            action={assignCounsellingRequest}
            className="rounded-xl border border-border/60 bg-ivory p-4"
          >
            <input type="hidden" name="requestId" value={request.id} />

            <label htmlFor="assignedTo" className="text-sm font-semibold text-navy">
              Assigned Counsellor / Team Member
            </label>

            <input
              id="assignedTo"
              name="assignedTo"
              type="text"
              defaultValue={request.assignedTo ?? ''}
              placeholder="Example: Pastor Mary, Counselling Team A"
              className="mt-3 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />

            <button
              type="submit"
              className="mt-3 rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-navy/90"
            >
              Save Assignment
            </button>
          </form>

          <form
            action={saveCounsellingAdminNotes}
            className="rounded-xl border border-border/60 bg-ivory p-4"
          >
            <input type="hidden" name="requestId" value={request.id} />

            <label htmlFor="adminNotes" className="text-sm font-semibold text-navy">
              Private Admin Notes
            </label>

            <textarea
              id="adminNotes"
              name="adminNotes"
              rows={5}
              defaultValue={request.adminNotes ?? ''}
              placeholder="Internal notes. These are not shown to the user."
              className="mt-3 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />

            <button
              type="submit"
              className="mt-3 rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-navy/90"
            >
              Save Notes
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <form action={markCounsellingContacted}>
            <input type="hidden" name="requestId" value={request.id} />
            <button
              type="submit"
              className="w-full rounded-lg border border-gold/40 px-4 py-3 text-sm font-semibold text-navy transition hover:bg-gold/10"
            >
              Mark Contacted
            </button>
          </form>

          <form action={markCounsellingInProgress}>
            <input type="hidden" name="requestId" value={request.id} />
            <button
              type="submit"
              className="w-full rounded-lg border border-navy/20 px-4 py-3 text-sm font-semibold text-navy transition hover:bg-navy/5"
            >
              Mark In Progress
            </button>
          </form>

          <form action={closeCounsellingRequest}>
            <input type="hidden" name="requestId" value={request.id} />
            <button
              type="submit"
              className="w-full rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-ivory transition hover:bg-navy/90"
            >
              Close Request
            </button>
          </form>
        </div>

        <div className="mt-5 rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm text-navy">
          Counselling requests are private. Do not share request details publicly or outside
          authorized ministry counselling/admin channels.
        </div>
      </section>
    </div>
  );
}
