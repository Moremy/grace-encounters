import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import {
  sendDonationReceipt,
  sendPrayerReminder,
  sendDevotionalNotification,
  sendEventReminder,
  queueNewsletterSend,
} from '@/lib/email/actions';

/**
 * POST /api/email/send
 * Internal API route for queued email sending.
 * Called by background job triggers or admin actions.
 *
 * Protected by webhook secret check.
 */
export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    const webhookSecret = process.env.WEBHOOK_SECRET;

    // Require authorization for production
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, payload } = body as {
      type: string;
      payload: Record<string, string>;
    };

    if (!type) {
      return NextResponse.json(
        { error: 'Missing "type" field' },
        { status: 400 },
      );
    }

    let result: { success: boolean; message?: string; error?: string };

    switch (type) {
      case 'donation_receipt':
        if (!payload?.donationId) {
          return NextResponse.json(
            { error: 'Missing donationId in payload' },
            { status: 400 },
          );
        }
        result = await sendDonationReceipt(payload.donationId);
        break;

      case 'prayer_reminder':
        if (!payload?.userId) {
          return NextResponse.json(
            { error: 'Missing userId in payload' },
            { status: 400 },
          );
        }
        result = await sendPrayerReminder(payload.userId);
        break;

      case 'devotional_notification':
        if (!payload?.devotionalId) {
          return NextResponse.json(
            { error: 'Missing devotionalId in payload' },
            { status: 400 },
          );
        }
        result = await sendDevotionalNotification(payload.devotionalId);
        break;

      case 'event_reminder':
        if (!payload?.eventId) {
          return NextResponse.json(
            { error: 'Missing eventId in payload' },
            { status: 400 },
          );
        }
        result = await sendEventReminder(payload.eventId);
        break;

      case 'newsletter':
        if (!payload?.subject || !payload?.content) {
          return NextResponse.json(
            { error: 'Missing subject or content in payload' },
            { status: 400 },
          );
        }
        result = await queueNewsletterSend(payload.subject, payload.content);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 },
        );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[Email Send Route]', err);
    return NextResponse.json(
      { error: 'Failed to process email request' },
      { status: 500 },
    );
  }
}
