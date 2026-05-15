'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function subscribeToPushNotifications(subscription: {
  endpoint: string;
  p256dh: string;
  auth: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  // Check if subscription already exists for this endpoint
  const existing = await prisma.pushSubscription.findFirst({
    where: { userId: user.id, endpoint: subscription.endpoint },
  });

  if (existing) {
    return { success: true, id: existing.id };
  }

  const created = await prisma.pushSubscription.create({
    data: {
      userId: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  });

  return { success: true, id: created.id };
}

export async function unsubscribeFromPushNotifications(endpoint: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  await prisma.pushSubscription.deleteMany({
    where: { userId: user.id, endpoint },
  });

  return { success: true };
}

export async function getUserPushSubscriptions() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  return prisma.pushSubscription.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
}
