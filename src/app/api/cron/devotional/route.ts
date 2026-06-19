import { NextResponse } from 'next/server';

import { generateDailyDevotional } from '@/lib/devotional/generate';

// Prisma + the Anthropic SDK require the Node.js runtime, and the result must
// never be statically cached — this endpoint runs work, it doesn't render.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Daily devotional cron endpoint.
 *
 * Intended to be called once per day by a scheduler (Vercel Cron, GitHub
 * Actions, an external cron service, etc.). Protected by the CRON_SECRET
 * environment variable, supplied as a Bearer token:
 *
 *   GET /api/cron/devotional
 *   Authorization: Bearer <CRON_SECRET>
 *
 * Vercel Cron automatically sends `Authorization: Bearer $CRON_SECRET` when a
 * CRON_SECRET env var is configured, so no extra setup is required there.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    console.error('[cron/devotional] CRON_SECRET is not configured.');
    return NextResponse.json(
      { success: false, error: 'Server is missing CRON_SECRET configuration.' },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized.' },
      { status: 401 },
    );
  }

  try {
    const devotional = await generateDailyDevotional();

    if (!devotional) {
      return NextResponse.json(
        {
          success: false,
          error:
            'No devotional available. Check that ANTHROPIC_API_KEY is set and at least one profile exists.',
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      devotional: {
        id: devotional.id,
        slug: devotional.slug,
        title: devotional.title,
        publishDate: devotional.publishDate,
      },
    });
  } catch (error) {
    console.error('[cron/devotional] Generation failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate devotional.' },
      { status: 500 },
    );
  }
}
