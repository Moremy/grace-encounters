'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

// ---------------------------------------------------------------------------
// Helper: get authenticated user or redirect
// ---------------------------------------------------------------------------

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  return user;
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

export async function getMyConversations() {
  const user = await requireAuth();

  const participations = await prisma.conversationParticipant.findMany({
    where: { userId: user.id },
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, displayName: true, avatarUrl: true },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: { select: { displayName: true } },
            },
          },
        },
      },
    },
  });

  const conversations = participations.map((p) => {
    const conv = p.conversation;
    const lastMessage = conv.messages[0] ?? null;
    const otherParticipants = conv.participants
      .filter((cp) => cp.userId !== user.id)
      .map((cp) => cp.user);

    // Calculate unread count
    const lastReadAt = p.lastReadAt;
    let unreadCount = 0;
    if (lastMessage && lastMessage.senderId !== user.id) {
      if (!lastReadAt || lastMessage.createdAt > lastReadAt) {
        unreadCount = 1; // At least one unread
      }
    }

    return {
      id: conv.id,
      type: conv.type,
      title: conv.title,
      otherParticipants,
      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            senderName: lastMessage.sender.displayName,
          }
        : null,
      unreadCount,
      updatedAt: conv.updatedAt,
    };
  });

  // Sort by most recent message first
  conversations.sort((a, b) => {
    const aDate = a.lastMessage?.createdAt ?? a.updatedAt;
    const bDate = b.lastMessage?.createdAt ?? b.updatedAt;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  return conversations;
}

export async function getConversationById(conversationId: string) {
  const user = await requireAuth();

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
    redirect('/messages');
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
        },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, displayName: true, avatarUrl: true } },
        },
      },
    },
  });

  if (!conversation) {
    redirect('/messages');
  }

  // Update lastReadAt for current user
  await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.id,
      },
    },
    data: { lastReadAt: new Date() },
  });

  return {
    ...conversation,
    currentUserId: user.id,
  };
}

export async function sendMessage(
  conversationId: string,
  content: string,
  mediaUrl?: string,
  mediaType?: string,
) {
  const user = await requireAuth();

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
    return { error: 'Not a participant in this conversation' };
  }

  // Validate content
  if (!content || content.length < 1 || content.length > 5000) {
    return { error: 'Message must be between 1 and 5000 characters' };
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

  const message = await prisma.message.create({
    data: messageData,
  });

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath('/messages');

  return { success: true, message };
}

export async function createDirectConversation(targetUserId: string) {
  const user = await requireAuth();

  if (targetUserId === user.id) {
    return { error: 'Cannot start a conversation with yourself' };
  }

  // Check if direct conversation already exists between these two users
  const existingParticipations = await prisma.conversationParticipant.findMany({
    where: { userId: user.id },
    include: {
      conversation: {
        include: {
          participants: true,
        },
      },
    },
  });

  const existingDirect = existingParticipations.find((p) => {
    const conv = p.conversation;
    if (conv.type !== 'DIRECT') return false;
    return conv.participants.some((cp) => cp.userId === targetUserId);
  });

  if (existingDirect) {
    return { conversationId: existingDirect.conversation.id };
  }

  // Create new direct conversation
  const conversation = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      participants: {
        create: [{ userId: user.id }, { userId: targetUserId }],
      },
    },
  });

  return { conversationId: conversation.id };
}

export async function createGroupConversation(
  title: string,
  participantIds: string[],
) {
  const user = await requireAuth();

  // Validate title
  if (!title || title.length < 3 || title.length > 100) {
    return { error: 'Group title must be between 3 and 100 characters' };
  }

  // Validate participants
  if (!participantIds || participantIds.length < 1) {
    return { error: 'At least one other participant is required' };
  }

  // Create group conversation with all participants
  const allParticipantIds = [user.id, ...participantIds.filter((id) => id !== user.id)];

  const conversation = await prisma.conversation.create({
    data: {
      type: 'GROUP',
      title,
      participants: {
        create: allParticipantIds.map((userId) => ({ userId })),
      },
    },
  });

  return { conversationId: conversation.id };
}

export async function getUnreadMessageCount() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return 0;
  }

  const participations = await prisma.conversationParticipant.findMany({
    where: { userId: user.id },
    select: {
      conversationId: true,
      lastReadAt: true,
    },
  });

  let totalUnread = 0;

  for (const p of participations) {
    const whereClause: {
      conversationId: string;
      senderId: { not: string };
      createdAt?: { gt: Date };
    } = {
      conversationId: p.conversationId,
      senderId: { not: user.id },
    };

    if (p.lastReadAt) {
      whereClause.createdAt = { gt: p.lastReadAt };
    }

    const count = await prisma.message.count({ where: whereClause });
    totalUnread += count;
  }

  return totalUnread;
}

export async function searchUsers(query: string) {
  const user = await requireAuth();

  if (!query || query.length < 1) {
    return [];
  }

  const profiles = await prisma.profile.findMany({
    where: {
      id: { not: user.id },
      OR: [
        { displayName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      email: true,
    },
    take: 10,
  });

  return profiles;
}
