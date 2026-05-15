'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from './client';
import { emailConfig } from './config';
import {
  renderDonationReceipt,
  renderPrayerReminder,
  renderDevotionalNotification,
  renderEventReminder,
  renderNewsletterEmail,
} from './templates';
import * as crypto from 'crypto';

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

function generateUnsubscribeToken(email: string): string {
  return crypto
    .createHmac('sha256', emailConfig.unsubscribeSecret)
    .update(email)
    .digest('hex');
}

function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = generateUnsubscribeToken(email);
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

// ---------------------------------------------------------------------------
// Newsletter actions
// ---------------------------------------------------------------------------

export async function subscribeToNewsletter(email: string) {
  if (!email || !email.includes('@')) {
    throw new Error('Please provide a valid email address');
  }

  const normalized = email.toLowerCase().trim();

  // Check if already subscribed
  const existing = await prisma.newsletterSubscription.findUnique({
    where: { email: normalized },
  });

  if (existing) {
    if (existing.active) {
      return { success: true, message: 'Already subscribed' };
    }
    // Reactivate
    await prisma.newsletterSubscription.update({
      where: { id: existing.id },
      data: { active: true, unsubscribedAt: null, subscribedAt: new Date() },
    });
    return { success: true, message: 'Subscription reactivated' };
  }

  // Try to link to authenticated user
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) userId = user.id;
  } catch {
    // Not authenticated - that's okay for newsletter
  }

  await prisma.newsletterSubscription.create({
    data: {
      email: normalized,
      userId,
    },
  });

  return { success: true, message: 'Successfully subscribed to newsletter' };
}

export async function unsubscribeFromNewsletter(token: string, email: string) {
  if (!token || !email) {
    throw new Error('Invalid unsubscribe link');
  }

  const normalized = email.toLowerCase().trim();

  if (!verifyUnsubscribeToken(normalized, token)) {
    throw new Error('Invalid unsubscribe token');
  }

  const subscription = await prisma.newsletterSubscription.findUnique({
    where: { email: normalized },
  });

  if (!subscription || !subscription.active) {
    return { success: true, message: 'Already unsubscribed' };
  }

  await prisma.newsletterSubscription.update({
    where: { id: subscription.id },
    data: { active: false, unsubscribedAt: new Date() },
  });

  return { success: true, message: 'Successfully unsubscribed' };
}

// ---------------------------------------------------------------------------
// Notification Preferences actions
// ---------------------------------------------------------------------------

export async function getNotificationPreferences() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  let prefs = await prisma.notificationPreference.findUnique({
    where: { userId: user.id },
  });

  if (!prefs) {
    prefs = await prisma.notificationPreference.create({
      data: { userId: user.id },
    });
  }

  return prefs;
}

export async function updateNotificationPreferences(data: {
  emailNewsletter?: boolean;
  prayerReminders?: boolean;
  devotionalNotifications?: boolean;
  eventReminders?: boolean;
  donationReceipts?: boolean;
  pushEnabled?: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const prefs = await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...data,
    },
    update: data,
  });

  revalidatePath('/settings/notifications');
  return prefs;
}

// ---------------------------------------------------------------------------
// Email sending actions
// ---------------------------------------------------------------------------

export async function sendDonationReceipt(donationId: string) {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: {
      donor: { select: { id: true, email: true, displayName: true } },
      campaign: { select: { title: true } },
    },
  });

  if (!donation) {
    throw new Error('Donation not found');
  }

  // Check user preference
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: donation.donorId },
  });

  if (prefs && !prefs.donationReceipts) {
    return { success: true, message: 'User opted out of donation receipts' };
  }

  const { html, text, subject } = renderDonationReceipt({
    donorName: donation.donor.displayName ?? 'Friend',
    amount: donation.amount.toString(),
    currency: donation.currency,
    date: donation.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    campaignTitle: donation.campaign?.title,
    transactionId: donation.providerTransactionId ?? undefined,
  });

  return sendEmail({
    to: donation.donor.email,
    subject,
    html,
    text,
    recipientId: donation.donorId,
    templateSlug: 'donation-receipt',
  });
}

export async function sendPrayerReminder(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { email: true, displayName: true },
  });

  if (!profile) {
    throw new Error('User not found');
  }

  // Check user preference
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (prefs && !prefs.prayerReminders) {
    return { success: true, message: 'User opted out of prayer reminders' };
  }

  // Get recent prayer requests
  const prayers = await prisma.prayerRequest.findMany({
    where: { status: 'APPROVED', visibility: 'PUBLIC' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { title: true, content: true },
  });

  if (prayers.length === 0) {
    return { success: true, message: 'No prayer requests to remind about' };
  }

  const { html, text, subject } = renderPrayerReminder({
    userName: profile.displayName ?? 'Friend',
    prayers: prayers.map((p) => ({
      title: p.title,
      excerpt: p.content.slice(0, 100) + (p.content.length > 100 ? '...' : ''),
    })),
  });

  return sendEmail({
    to: profile.email,
    subject,
    html,
    text,
    recipientId: userId,
    templateSlug: 'prayer-reminder',
  });
}

export async function sendDevotionalNotification(devotionalId: string) {
  const devotional = await prisma.devotional.findUnique({
    where: { id: devotionalId },
    select: { title: true, excerpt: true, scriptureReference: true, slug: true },
  });

  if (!devotional) {
    throw new Error('Devotional not found');
  }

  // Get all users who have devotional notifications enabled
  const subscribers = await prisma.notificationPreference.findMany({
    where: { devotionalNotifications: true },
    include: { user: { select: { id: true, email: true } } },
  });

  const { html, text, subject } = renderDevotionalNotification({
    title: devotional.title,
    excerpt: devotional.excerpt,
    scriptureReference: devotional.scriptureReference,
    slug: devotional.slug,
  });

  const results = await Promise.allSettled(
    subscribers.map((sub) =>
      sendEmail({
        to: sub.user.email,
        subject,
        html,
        text,
        recipientId: sub.userId,
        templateSlug: 'devotional-notification',
      }),
    ),
  );

  const sent = results.filter(
    (r) => r.status === 'fulfilled' && r.value.success,
  ).length;

  return { success: true, message: `Sent to ${sent} subscribers` };
}

export async function sendEventReminder(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      title: true,
      description: true,
      date: true,
      location: true,
    },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  // Get all users who have event reminders enabled
  const subscribers = await prisma.notificationPreference.findMany({
    where: { eventReminders: true },
    include: { user: { select: { id: true, email: true } } },
  });

  const eventDate = new Date(event.date);
  const { html, text, subject } = renderEventReminder({
    eventTitle: event.title,
    date: eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    time: eventDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }),
    location: event.location,
    description:
      event.description.slice(0, 200) +
      (event.description.length > 200 ? '...' : ''),
  });

  const results = await Promise.allSettled(
    subscribers.map((sub) =>
      sendEmail({
        to: sub.user.email,
        subject,
        html,
        text,
        recipientId: sub.userId,
        templateSlug: 'event-reminder',
      }),
    ),
  );

  const sent = results.filter(
    (r) => r.status === 'fulfilled' && r.value.success,
  ).length;

  return { success: true, message: `Sent to ${sent} subscribers` };
}

export async function queueNewsletterSend(subject: string, content: string) {
  if (!subject || !content) {
    throw new Error('Subject and content are required');
  }

  // Get all active newsletter subscribers
  const subscribers = await prisma.newsletterSubscription.findMany({
    where: { active: true },
    select: { email: true, userId: true },
  });

  const { html, text, subject: emailSubject } = renderNewsletterEmail({
    subject,
    content,
  });

  const results = await Promise.allSettled(
    subscribers.map((sub) =>
      sendEmail({
        to: sub.email,
        subject: emailSubject,
        html,
        text,
        recipientId: sub.userId ?? undefined,
        templateSlug: 'newsletter',
      }),
    ),
  );

  const sent = results.filter(
    (r) => r.status === 'fulfilled' && r.value.success,
  ).length;

  return { success: true, message: `Newsletter queued for ${sent} subscribers` };
}
