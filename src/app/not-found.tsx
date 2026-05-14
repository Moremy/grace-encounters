import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-sans text-sm uppercase tracking-[0.2em] text-muted-foreground">
        404
      </p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
        This page could not be found
      </h1>
      <blockquote className="mt-8 max-w-xl text-pretty font-serif text-lg italic text-muted-foreground">
        &ldquo;He heals the brokenhearted and binds up their wounds.&rdquo;
        <footer className="mt-2 text-sm not-italic tracking-wide text-muted-foreground">
          — Psalm 147:3
        </footer>
      </blockquote>
      <Link
        href="/"
        className="mt-10 inline-flex items-center justify-center rounded-md border border-border bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Return home
      </Link>
    </main>
  );
}
