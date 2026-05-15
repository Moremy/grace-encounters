'use client';

import { useState, useTransition } from 'react';
import { Mail } from 'lucide-react';
import { subscribeToNewsletter } from '@/lib/email/actions';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    startTransition(async () => {
      try {
        const result = await subscribeToNewsletter(email);
        setMessage(result.message);
        setIsError(false);
        setEmail('');
      } catch (err) {
        setMessage(
          err instanceof Error ? err.message : 'Something went wrong',
        );
        setIsError(true);
      }
    });
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full rounded-md border border-gray-200 bg-white px-9 py-2.5 text-sm placeholder:text-muted-foreground focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
            aria-label="Email address for newsletter"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md bg-[#1e3a5f] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1e3a5f]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {message && (
        <p
          className={`mt-2 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}
          role="alert"
        >
          {message}
        </p>
      )}
    </div>
  );
}
