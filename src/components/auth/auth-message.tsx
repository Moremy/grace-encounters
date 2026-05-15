'use client';

import { useSearchParams } from 'next/navigation';

export function AuthMessage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const success = searchParams.get('success');

  if (!error && !success) {
    return null;
  }

  return (
    <div className="mb-4 space-y-2">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}
    </div>
  );
}
