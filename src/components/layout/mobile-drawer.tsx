'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Wordmark } from '@/components/brand/wordmark';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/lib/auth/actions';

const publicLinks: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'Testimonies', href: '/testimonies' },
  { label: 'Books', href: '/books' },
  { label: 'Blog', href: '/blog' },
  { label: 'Faith News', href: '/news' },
  { label: 'Events / Crusades', href: '/events' },
  { label: 'Media', href: '/media' },
  { label: 'Community', href: '/community' },
];

export function MobileDrawer() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Check auth state on mount and listen for changes
  React.useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      {/* Hamburger button - visible only on mobile */}
      <button
        type="button"
        aria-label="Open navigation menu"
        className={cn(
          'md:hidden inline-flex items-center justify-center rounded-md p-2',
          'text-navy hover:text-gold transition-colors',
        )}
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Backdrop overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-72 bg-ivory shadow-xl',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header: Wordmark + close button */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-gold/30">
          <Wordmark size="md" />
          <button
            type="button"
            aria-label="Close navigation menu"
            className="inline-flex items-center justify-center rounded-md p-2 text-navy hover:text-gold transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-6 py-4">
          <ul className="space-y-0">
            {publicLinks.map((link, index) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'block py-3 font-serif text-navy transition-colors hover:text-gold',
                    (index < publicLinks.length - 1 || isAuthenticated) && 'border-b border-gold/10',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {isAuthenticated && (
              <li>
                <Link
                  href="/dashboard"
                  className="block py-3 font-serif text-navy transition-colors hover:text-gold"
                >
                  Dashboard
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Divider */}
        <div className="border-t border-gold/30 mx-6" />

        {/* Auth section */}
        <div className="px-6 py-4">
          {isAuthenticated ? (
            <form action={signOut}>
              <button
                type="submit"
                className="w-full text-left font-serif text-navy py-3 transition-colors hover:text-gold"
              >
                Sign Out
              </button>
            </form>
          ) : (
            <Link
              href="/sign-in"
              className="block font-serif text-navy py-3 transition-colors hover:text-gold"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
