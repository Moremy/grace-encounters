import { NextRequest, NextResponse } from 'next/server';

import { categorizeTestimony } from '@/lib/ai/actions';

export async function POST(request: NextRequest) {
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
