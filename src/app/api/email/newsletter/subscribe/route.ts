import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { applySensitiveRateLimit } from '@/lib/middleware/rate-limit-middleware';

/**
 * POST /api/email/newsletter/subscribe
 * API route for newsletter subscription from marketing pages.
 * Supports JSON and form-encoded POST requests.
 */
export async function POST(request: Request) {
  // Rate limit to prevent subscription-bomb attacks
  const rateLimitResponse = applySensitiveRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    let email: string | null = null;

    const contentType = request.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      email = body.email;
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      email = formData.get('email') as string | null;
    } else {
      // Try JSON fallback
      const body = await request.json().catch(() => null);
      email = body?.email ?? null;
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 },
      );
    }

    const normalized = email.toLowerCase().trim();

    // Check if already subscribed
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: normalized },
    });

    if (existing) {
      if (existing.active) {
        return NextResponse.json({
          success: true,
          message: 'Already subscribed',
        });
      }
      // Reactivate
      await prisma.newsletterSubscription.update({
        where: { id: existing.id },
        data: { active: true, unsubscribedAt: null, subscribedAt: new Date() },
      });
      return NextResponse.json({
        success: true,
        message: 'Subscription reactivated',
      });
    }

    await prisma.newsletterSubscription.create({
      data: { email: normalized },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
    });
  } catch (err) {
    console.error('[Newsletter Subscribe]', err);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 },
    );
  }
}
