'use client';

import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f9f7f4] px-4 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-[#1e3a5f]/10 p-6">
            <WifiOff className="h-12 w-12 text-[#1e3a5f]" />
          </div>
        </div>

        <h1 className="font-serif text-3xl font-bold text-[#1e3a5f]">
          You are offline
        </h1>

        <p className="text-muted-foreground">
          It looks like you have lost your internet connection. Please check your
          network settings and try again.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-md bg-[hsl(38,44%,61%)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[hsl(38,44%,51%)]"
        >
          Try Again
        </button>

        <p className="text-xs text-muted-foreground">
          Some previously visited pages may be available offline.
        </p>
      </div>
    </div>
  );
}
