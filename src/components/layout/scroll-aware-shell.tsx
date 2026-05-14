'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

interface ScrollAwareShellProps extends React.HTMLAttributes<HTMLElement> {
  baseClassName?: string;
  scrolledClassName?: string;
  threshold?: number;
  children: React.ReactNode;
}

/**
 * Tiny client wrapper that toggles a className when the page has been
 * scrolled past `threshold` pixels. Only the className-changing element
 * needs to be a client component, so `children` (the actual header
 * markup) can stay server-rendered.
 */
export function ScrollAwareShell({
  baseClassName,
  scrolledClassName,
  threshold = 8,
  className,
  children,
  ...rest
}: ScrollAwareShellProps) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return (
    <header
      className={cn(className, scrolled ? scrolledClassName : baseClassName)}
      {...rest}
    >
      {children}
    </header>
  );
}
