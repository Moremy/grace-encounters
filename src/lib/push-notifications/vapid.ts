/**
 * VAPID key utilities for Web Push notifications.
 * Reads keys from environment variables.
 */

export function getVapidPublicKey(): string {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) {
    throw new Error(
      'NEXT_PUBLIC_VAPID_PUBLIC_KEY environment variable is not set',
    );
  }
  return key;
}

export function getVapidPrivateKey(): string {
  const key = process.env.VAPID_PRIVATE_KEY;
  if (!key) {
    throw new Error('VAPID_PRIVATE_KEY environment variable is not set');
  }
  return key;
}
