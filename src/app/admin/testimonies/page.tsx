import type { Metadata } from 'next';
import * as React from 'react';
import { redirect } from 'next/navigation';
import { BookHeart, FileText, Headphones, Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { canModerate, fromPrismaRole } from '@/lib/auth/roles';
import { updateTestimonyStatus } from '@/lib/testimony/actions';

export const metadata: Metadata = {
  title: 'Manage Testimonies | Admin',
  description: 'Review and moderate testimonies submitted by the community.',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  FEATURED: 'bg-purple-100 text-purple-800',
  REJECTED: 'bg-red-100 text-red-800',
  NEEDS_REVISION: 'bg-orange-100 text-orange-800',
};

const MEDIA_ICONS: Record<string, React.ReactNode> = {
  TEXT: <BookHeart className="h-4 w-4" />,
  PDF: <FileText className="h-4 w-4" />,
  AUDIO: <Headphones className="h-4 w-4" />,
  VIDEO: <Play className="h-4 w-4" />,
};

export default async function AdminTestimoniesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  const role = fromPrismaRole(profile?.role ?? null);

  if (!canModerate(role)) {
    redirect('/dashboard');
  }

  const statusFilter =
    typeof searchParams.status === 'string' ? searchParams.status : undefined;

  const whereClause = statusFilter ? { status: statusFilter as never } : {};

  const testimonies = await prisma.testimony.findMany({
    where: whereClause,
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-navy">
          Manage Testimonies
        </h1>
        <p className="mt-2 text-muted-foreground">
          Review, approve, and moderate community testimonies.
        </p>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: '', label: 'All' },
          { value: 'PENDING', label: 'Pending' },
          { value: 'APPROVED', label: 'Approved' },
          { value: 'FEATURED', label: 'Featured' },
          { value: 'NEEDS_REVISION', label: 'Needs Revision' },
          { value: 'REJECTED', label: 'Rejected' },
        ].map((s) => (
          <Button
            key={s.value}
            variant={statusFilter === s.value || (!statusFilter && !s.value) ? 'default' : 'outline'}
            size="sm"
            asChild
          >
            <a
              href={
                s.value
                  ? `/admin/testimonies?status=${s.value}`
                  : '/admin/testimonies'
              }
            >
              {s.label}
            </a>
          </Button>
        ))}
      </div>

      {testimonies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No testimonies found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonies.map((testimony) => (
            <Card key={testimony.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-gold">
                      {MEDIA_ICONS[testimony.mediaType] ?? MEDIA_ICONS.TEXT}
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {testimony.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        By {testimony.author.displayName} &middot;{' '}
                        {new Date(testimony.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {testimony.category && (
                      <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">
                        {testimony.category.charAt(0) + testimony.category.slice(1).toLowerCase()}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[testimony.status] ?? 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {testimony.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {testimony.excerpt}
                </p>
                <div className="flex flex-wrap gap-2">
                  {testimony.status !== 'APPROVED' && (
                    <form action={updateTestimonyStatus.bind(null, testimony.id, 'APPROVED')}>
                      <Button type="submit" size="sm" variant="outline" className="text-green-700 border-green-200">
                        Approve
                      </Button>
                    </form>
                  )}
                  {testimony.status !== 'FEATURED' && (
                    <form action={updateTestimonyStatus.bind(null, testimony.id, 'FEATURED')}>
                      <Button type="submit" size="sm" variant="outline" className="text-purple-700 border-purple-200">
                        Feature
                      </Button>
                    </form>
                  )}
                  {testimony.status !== 'NEEDS_REVISION' && (
                    <form action={updateTestimonyStatus.bind(null, testimony.id, 'NEEDS_REVISION')}>
                      <Button type="submit" size="sm" variant="outline" className="text-orange-700 border-orange-200">
                        Request Revision
                      </Button>
                    </form>
                  )}
                  {testimony.status !== 'REJECTED' && (
                    <form action={updateTestimonyStatus.bind(null, testimony.id, 'REJECTED')}>
                      <Button type="submit" size="sm" variant="outline" className="text-red-700 border-red-200">
                        Reject
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
