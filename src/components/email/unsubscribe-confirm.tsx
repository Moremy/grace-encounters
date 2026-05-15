'use client';

import { useState, useTransition } from 'react';
import { MailX } from 'lucide-react';
import { unsubscribeFromNewsletter } from '@/lib/email/actions';

interface UnsubscribeConfirmProps {
  email: string;
  token: string;
}

export function UnsubscribeConfirm({ email, token }: UnsubscribeConfirmProps) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleUnsubscribe = () => {
    startTransition(async () => {
      try {
        const result = await unsubscribeFromNewsletter(token, email);
        setMessage(result.message);
        setStatus('success');
      } catch (err) {
        setMessage(
          err instanceof Error ? err.message : 'Something went wrong',
        );
        setStatus('error');
      }
    });
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <MailX className="h-12 w-12 text-[#b8975a]" />
        <h2 className="font-serif text-xl font-bold text-[#1e3a5f]">
          Unsubscribed
        </h2>
        <p className="text-muted-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">
          You will no longer receive newsletter emails from us.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <MailX className="h-12 w-12 text-[#1e3a5f]" />
      <h2 className="font-serif text-xl font-bold text-[#1e3a5f]">
        Unsubscribe from Newsletter
      </h2>
      <p className="text-muted-foreground">
        Are you sure you want to unsubscribe <strong>{email}</strong> from the
        Light and Salt newsletter?
      </p>
      {status === 'error' && (
        <p className="text-sm text-red-600" role="alert">
          {message}
        </p>
      )}
      <button
        onClick={handleUnsubscribe}
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-md bg-[#1e3a5f] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1e3a5f]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Unsubscribing...' : 'Confirm Unsubscribe'}
      </button>
    </div>
  );
}
