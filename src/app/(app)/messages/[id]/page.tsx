import * as React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MessageThread } from '@/components/messaging/message-thread';
import { MessageInput } from '@/components/messaging/message-input';
import { getConversationById } from '@/lib/messaging/actions';

export const metadata: Metadata = {
  title: 'Conversation | Light and Salt',
  description: 'View your conversation.',
};

interface ConversationPageProps {
  params: { id: string };
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const conversation = await getConversationById(params.id);

  const otherParticipants = conversation.participants.filter(
    (p) => p.userId !== conversation.currentUserId,
  );

  const displayName =
    conversation.type === 'GROUP'
      ? conversation.title ?? 'Group Chat'
      : otherParticipants[0]?.user.displayName ?? 'Unknown';

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/messages" aria-label="Back to messages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-medium text-ivory">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium">{displayName}</p>
            {conversation.type === 'GROUP' && (
              <p className="text-xs text-muted-foreground">
                {conversation.participants.length} members
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageThread
        messages={conversation.messages}
        currentUserId={conversation.currentUserId}
      />

      {/* Input */}
      <MessageInput conversationId={params.id} />
    </div>
  );
}
