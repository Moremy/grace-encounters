import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

export type PushPreferenceField =
  | 'devotionalNotifications'
  | 'prayerReminders'
  | 'eventReminders';

export interface PushPayload {
  title: string;
  body: string;
  url: string;
}

let vapidConfigured = false;

function configureVapid(): boolean {
  if (vapidConfigured) return true;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    return false;
  }

  webpush.setVapidDetails('mailto:hello@lightbearers.org', publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

/**
 * Send a push notification to every subscribed member who has push enabled
 * and has opted in to this notification type. Missing preference rows count
 * as opted in, matching the Prisma defaults.
 *
 * Never throws — push delivery must not break the action that triggered it.
 */
export async function broadcastPush(
  payload: PushPayload,
  preference: PushPreferenceField,
): Promise<void> {
  try {
    if (!configureVapid()) {
      console.warn('broadcastPush skipped: VAPID keys are not configured');
      return;
    }

    const optedOut = await prisma.notificationPreference.findMany({
      where: { OR: [{ pushEnabled: false }, { [preference]: false }] },
      select: { userId: true },
    });
    const excludedUserIds = optedOut.map((p) => p.userId);

    const subscriptions = await prisma.pushSubscription.findMany({
      where: excludedUserIds.length ? { userId: { notIn: excludedUserIds } } : {},
    });

    if (subscriptions.length === 0) return;

    const message = JSON.stringify(payload);

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            message,
          );
        } catch (err: unknown) {
          const statusCode =
            err && typeof err === 'object' && 'statusCode' in err
              ? (err as { statusCode: number }).statusCode
              : null;
          // 404/410 mean the subscription is gone (browser revoked it) —
          // prune it so we stop pushing to a dead endpoint.
          if (statusCode === 404 || statusCode === 410) {
            await prisma.pushSubscription
              .delete({ where: { id: sub.id } })
              .catch(() => {});
          }
        }
      }),
    );
  } catch (err) {
    console.error('broadcastPush error:', err);
  }
}
