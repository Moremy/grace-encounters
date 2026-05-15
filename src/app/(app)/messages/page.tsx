import * as React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConversationList } from '@/components/messaging/conversation-list';
import { getMyConversations } from '@/lib/messaging/actions';

export const metadata: Metadata = {
  title: 'Messages | Light and Salt',
  description: 'Your conversations and messages.',
};

export default async function MessagesPage() {
  const conversations = await getMyConversations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-navy">
            Messages
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stay connected with your community.
          </p>
        </div>
        <Button variant="sacred" asChild>
          <Link href="/messages/new">New Message</Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h2 className="text-lg font-medium">No conversations yet</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Start a new message to connect with someone in the community.
            </p>
            <Button variant="sacred" asChild className="mt-6">
              <Link href="/messages/new">Start a Conversation</Link>
            </Button>
          </div>
        ) : (
          <ConversationList conversations={conversations} />
        )}
      </div>
    </div>
  );
}
