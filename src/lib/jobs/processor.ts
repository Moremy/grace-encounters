'use server';

import { startJob, markJobComplete, markJobFailed } from './queue';
import type { BackgroundJob } from '@prisma/client';

type JobHandler = (payload: Record<string, unknown>) => Promise<void>;

/**
 * Job type handlers.
 * Each handler processes the payload for a specific job type.
 */
const jobHandlers: Record<string, JobHandler> = {
  SEND_EMAIL: async (payload) => {
    // TODO: Integrate with email sending service
    console.log('[JobProcessor] Processing SEND_EMAIL:', payload);
  },

  SEND_PUSH_NOTIFICATION: async (payload) => {
    // TODO: Integrate with push notification service
    console.log('[JobProcessor] Processing SEND_PUSH_NOTIFICATION:', payload);
  },

  PROCESS_UPLOAD: async (payload) => {
    // TODO: Integrate with image processing pipeline
    console.log('[JobProcessor] Processing PROCESS_UPLOAD:', payload);
  },

  GENERATE_AI_RECOMMENDATION: async (payload) => {
    // TODO: Integrate with AI recommendation service
    console.log('[JobProcessor] Processing GENERATE_AI_RECOMMENDATION:', payload);
  },
};

/**
 * Execute a single background job by dispatching to the appropriate handler.
 */
export async function executeJob(job: BackgroundJob): Promise<boolean> {
  const handler = jobHandlers[job.type];

  if (!handler) {
    await markJobFailed(job.id, `Unknown job type: ${job.type}`);
    return false;
  }

  await startJob(job.id);

  try {
    await handler(job.payload as Record<string, unknown>);
    await markJobComplete(job.id);
    return true;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    await markJobFailed(job.id, errorMessage);
    return false;
  }
}
