import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeJob } from '@/lib/jobs/processor';

/**
 * Background job processing endpoint.
 * Protected with API secret key - intended to be triggered by cron/scheduler.
 *
 * POST /api/jobs/process
 * Headers: { Authorization: Bearer <API_SECRET> }
 */
export async function POST(request: Request) {
  // Verify API secret key
  const authHeader = request.headers.get('authorization');
  const apiSecret = process.env.JOB_PROCESSING_SECRET;

  if (!apiSecret || authHeader !== `Bearer ${apiSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get next batch of pending jobs (process up to 10 at a time)
  const pendingJobs = await prisma.backgroundJob.findMany({
    where: {
      status: 'PENDING',
      scheduledFor: { lte: new Date() },
    },
    orderBy: { scheduledFor: 'asc' },
    take: 10,
  });

  if (pendingJobs.length === 0) {
    return NextResponse.json({ processed: 0, message: 'No pending jobs' });
  }

  const results = await Promise.allSettled(
    pendingJobs
      .filter((job) => job.attempts < job.maxAttempts)
      .map((job) => executeJob(job)),
  );

  const succeeded = results.filter(
    (r) => r.status === 'fulfilled' && r.value === true,
  ).length;
  const failed = results.filter(
    (r) => r.status === 'rejected' || (r.status === 'fulfilled' && r.value === false),
  ).length;

  return NextResponse.json({
    processed: results.length,
    succeeded,
    failed,
  });
}
