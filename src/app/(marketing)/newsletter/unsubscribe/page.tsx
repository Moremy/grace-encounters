import type { Metadata } from 'next';
import { UnsubscribeConfirm } from '@/components/email/unsubscribe-confirm';

export const metadata: Metadata = {
  title: 'Unsubscribe — Light and Salt',
};

interface PageProps {
  searchParams: { token?: string; email?: string };
}

export default function UnsubscribePage({ searchParams }: PageProps) {
  const { token, email } = searchParams;

  if (!token || !email) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-2xl font-bold text-[#1e3a5f]">
            Invalid Link
          </h1>
          <p className="mt-2 text-muted-foreground">
            This unsubscribe link is invalid or expired. Please use the link
            from your email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
        <UnsubscribeConfirm email={email} token={token} />
      </div>
    </div>
  );
}
