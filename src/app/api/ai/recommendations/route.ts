import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { applyRateLimit } from '@/lib/middleware/rate-limit-middleware';
import { isAIEnabled, AI_CONFIG } from '@/lib/ai/config';
import { CONTENT_RECOMMENDATION_PROMPT } from '@/lib/ai/prompts';

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
    if (!isAIEnabled()) {
      return NextResponse.json({
        recommendations: [
          {
            type: 'devotional',
            reason: 'Start your day with spiritual nourishment.',
            keywords: ['devotional', 'daily', 'scripture'],
          },
          {
            type: 'testimony',
            reason: 'Be encouraged by stories of faith.',
            keywords: ['testimony', 'faith', 'encouragement'],
          },
          {
            type: 'sermon',
            reason: "Deepen your understanding of God's Word.",
            keywords: ['sermon', 'teaching', 'bible'],
          },
        ],
        source: 'fallback',
      });
    }

    // Stream the response from OpenAI-compatible API
    const response = await fetch(`${AI_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [
          { role: 'system', content: CONTENT_RECOMMENDATION_PROMPT },
          {
            role: 'user',
            content: `Generate personalized content recommendations for user ${user.id}. Suggest a mix of testimonies, devotionals, and sermons.`,
          },
        ],
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      return NextResponse.json(
        { error: 'AI service unavailable' },
        { status: 502 },
      );
    }

    // Return streaming response
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[AI Recommendations API]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
