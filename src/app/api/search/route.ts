import { NextRequest, NextResponse } from 'next/server';
import { globalSearch } from '@/lib/search/actions';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type') ?? 'all';
  const limit = parseInt(searchParams.get('limit') ?? '20', 10);

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 },
    );
  }

  try {
    const results = await globalSearch(query.trim(), type);
    const limited = results.slice(0, limit);

    return NextResponse.json({ results: limited, total: results.length });
  } catch {
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 },
    );
  }
}
