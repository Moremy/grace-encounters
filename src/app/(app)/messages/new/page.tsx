'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { NewConversation } from '@/components/messaging/new-conversation';

export default function NewMessagePage() {
  const router = useRouter();

  function handleConversationCreated(id: string) {
    router.push(`/messages/${id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/messages" aria-label="Back to messages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-serif text-2xl tracking-tight text-navy">
          New Message
        </h1>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <NewConversation onConversationCreated={handleConversationCreated} />
      </div>
    </div>
  );
}
