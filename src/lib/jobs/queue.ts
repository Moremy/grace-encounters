'use server';

import { prisma } from '@/lib/prisma';

export type JobType =
  | 'SEND_EMAIL'
  | 'SEND_PUSH_NOTIFICATION'
  | 'PROCESS_UPLOAD'
  | 'GENERATE_AI_RECOMMENDATION';

/**
 * Enqueue a background job for processing.
 */
export async function enqueueJob(
  type: JobType,
  payload: Record<string, unknown>,
  scheduledFor?: Date,
): Promise<string> {
  const job = await prisma.backgroundJob.create({
    data: {
      type,
      payload,
      status: 'PENDING',
      scheduledFor: scheduledFor ?? new Date(),
    },
  });

  return job.id;
}

/**
 * Get the next pending job ready for processing.
 */
export async function getNextPendingJob() {
  const job = await prisma.backgroundJob.findFirst({
    where: {
      status: 'PENDING',
      scheduledFor: { lte: new Date() },
    },
    orderBy: { scheduledFor: 'asc' },
  });

  if (!job || job.attempts >= job.maxAttempts) {
    return null;
  }

  return job;
}

/**
 * Mark a job as currently processing.
 */
export async function startJob(jobId: string) {
  return prisma.backgroundJob.update({
    where: { id: jobId },
    data: {
      status: 'PROCESSING',
      startedAt: new Date(),
      attempts: { increment: 1 },
    },
  });
}

/**
 * Mark a job as completed.
 */
export async function markJobComplete(jobId: string) {
  return prisma.backgroundJob.update({
    where: { id: jobId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });
}

/**
 * Mark a job as failed with an error message.
 * If attempts < maxAttempts, reset status to PENDING for retry.
 */
export async function markJobFailed(jobId: string, error: string) {
  const job = await prisma.backgroundJob.findUnique({
    where: { id: jobId },
  });

  if (!job) return null;

  const shouldRetry = job.attempts < job.maxAttempts;

  return prisma.backgroundJob.update({
    where: { id: jobId },
    data: {
      status: shouldRetry ? 'PENDING' : 'FAILED',
      error,
      completedAt: shouldRetry ? null : new Date(),
    },
  });
}

/**
 * Process a single job by ID.
 */
export async function processJob(jobId: string) {
  const job = await prisma.backgroundJob.findUnique({
    where: { id: jobId },
  });

  if (!job || job.status !== 'PENDING') {
    return null;
  }

  return job;
}
