import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { applyRateLimit } from '@/lib/middleware/rate-limit-middleware';

export async function POST(request: NextRequest) {
  // Rate limit check
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { conversationId?: string; content?: string; mediaUrl?: string; mediaType?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { conversationId, content, mediaUrl, mediaType } = body;

  if (!conversationId || !content) {
    return NextResponse.json(
      { error: 'conversationId and content are required' },
      { status: 400 },
    );
  }

  if (content.length < 1 || content.length > 5000) {
    return NextResponse.json(
      { error: 'Content must be between 1 and 5000 characters' },
      { status: 400 },
    );
  }

  // Verify user is participant
  const participation = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.id,
      },
    },
  });

  if (!participation) {
    return NextResponse.json(
      { error: 'Not a participant in this conversation' },
      { status: 403 },
    );
  }

  const messageData: {
    conversationId: string;
    senderId: string;
    content: string;
    mediaUrl?: string;
    mediaType?: 'IMAGE' | 'FILE' | 'AUDIO';
  } = {
    conversationId,
    senderId: user.id,
    content,
  };

  if (mediaUrl) {
    messageData.mediaUrl = mediaUrl;
  }

  if (mediaType && ['IMAGE', 'FILE', 'AUDIO'].includes(mediaType)) {
    messageData.mediaType = mediaType as 'IMAGE' | 'FILE' | 'AUDIO';
  }

  try {
    const message = await prisma.message.create({ data: messageData });
    return NextResponse.json({ success: true, message });
  } catch {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 },
    );
  }
}
