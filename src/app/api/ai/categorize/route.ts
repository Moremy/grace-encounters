import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { applyRateLimit } from '@/lib/middleware/rate-limit-middleware';
import { categorizeTestimony } from '@/lib/ai/actions';

export async function POST(request: NextRequest) {
  // Rate limit AI requests
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  // Require authentication to prevent unauthorized API token consumption
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'content is required and must be a string' },
        { status: 400 },
      );
    }

    if (content.length < 10) {
      return NextResponse.json(
        { error: 'content must be at least 10 characters' },
        { status: 400 },
      );
    }

    const categorization = await categorizeTestimony(content);

    return NextResponse.json(categorization);
  } catch (error) {
    console.error('[AI Categorize API]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
