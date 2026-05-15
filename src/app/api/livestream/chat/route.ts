import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const streamId = searchParams.get('streamId');
  const after = searchParams.get('after');

  if (!streamId) {
    return NextResponse.json(
      { error: 'streamId is required' },
      { status: 400 },
    );
  }

  const where: Record<string, unknown> = { streamId };

  if (after) {
    where.createdAt = { gt: new Date(after) };
  }

  const messages = await prisma.liveStreamChat.findMany({
    where,
    include: {
      author: { select: { displayName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });

  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { streamId, content } = body as { streamId?: string; content?: string };

  if (!streamId || !content) {
    return NextResponse.json(
      { error: 'streamId and content are required' },
      { status: 400 },
    );
  }

  const trimmed = content.trim();
  if (trimmed.length < 1 || trimmed.length > 500) {
    return NextResponse.json(
      { error: 'Message must be between 1 and 500 characters' },
      { status: 400 },
    );
  }

  // Verify stream exists and is live
  const stream = await prisma.liveStream.findFirst({
    where: { id: streamId, status: 'LIVE' },
  });

  if (!stream) {
    return NextResponse.json(
      { error: 'Stream not found or not live' },
      { status: 404 },
    );
  }

  const message = await prisma.liveStreamChat.create({
    data: {
      streamId,
      authorId: user.id,
      content: trimmed,
    },
    include: {
      author: { select: { displayName: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(message);
}
