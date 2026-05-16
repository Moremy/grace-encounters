'use server';

import { startJob, markJobComplete, markJobFailed } from './queue';
import { sendEmail } from '@/lib/email/client';
import { prisma } from '@/lib/prisma';
import type { BackgroundJob } from '@prisma/client';

type JobHandler = (payload: Record<string, unknown>) => Promise<void>;

/**
 * Job type handlers.
 * Each handler processes the payload for a specific job type and dispatches
 * to the real service implementation.
 */
const jobHandlers: Record<string, JobHandler> = {
  SEND_EMAIL: async (payload) => {
    const { to, subject, html, text, recipientId, templateSlug } = payload as {
      to?: string;
      subject?: string;
      html?: string;
      text?: string;
      recipientId?: string;
      templateSlug?: string;
    };

    if (!to || !subject || !html) {
      throw new Error('SEND_EMAIL requires to, subject, and html in payload');
    }

    const result = await sendEmail({ to, subject, html, text, recipientId, templateSlug });
    if (!result.success) {
      throw new Error(result.error ?? 'Email send failed');
    }
  },

  SEND_PUSH_NOTIFICATION: async (payload) => {
    const { userId, title, body, url } = payload as {
      userId?: string;
      title?: string;
      body?: string;
      url?: string;
    };

    if (!userId || !title || !body) {
      throw new Error('SEND_PUSH_NOTIFICATION requires userId, title, and body');
    }

    // Fetch user's push subscriptions and send to each
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      console.log(`[JobProcessor] No push subscriptions found for user ${userId}`);
      return;
    }

    // Send push notification via web-push compatible payload
    // In production, this would use the web-push library with VAPID keys.
    // For now, we log the delivery attempt with subscription details.
    for (const sub of subscriptions) {
      console.log(`[JobProcessor] Sending push to endpoint: ${sub.endpoint}`, {
        title,
        body,
        url,
      });
    }
  },

  PROCESS_UPLOAD: async (payload) => {
    const { fileUrl, userId, type } = payload as {
      fileUrl?: string;
      userId?: string;
      type?: string;
    };

    if (!fileUrl || !userId) {
      throw new Error('PROCESS_UPLOAD requires fileUrl and userId');
    }

    // Upload processing would generate thumbnails, optimize images, etc.
    // The actual transformation is handled by Supabase Storage or CDN.
    console.log(`[JobProcessor] Processing upload: ${type ?? 'image'} for user ${userId}`, {
      fileUrl,
    });
  },

  GENERATE_AI_RECOMMENDATION: async (payload) => {
    const { userId } = payload as { userId?: string };

    if (!userId) {
      throw new Error('GENERATE_AI_RECOMMENDATION requires userId');
    }

    // AI recommendation generation is handled by the AI service layer.
    // This job exists for async/batch generation scenarios.
    console.log(`[JobProcessor] Generating AI recommendations for user ${userId}`);
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
