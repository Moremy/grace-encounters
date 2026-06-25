'use client';
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-4">
      <p className="text-center text-burgundy font-medium">Something went wrong loading this page.</p>
      <button onClick={reset} className="text-teal underline text-sm">Try again</button>
    </div>
  );
}
