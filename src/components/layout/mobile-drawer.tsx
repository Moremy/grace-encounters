'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
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
  { label: 'Fundraisers', href: '/fundraisers' },
];

const authenticatedLinks: { label: string; href: string }[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'My Fundraisers', href: '/dashboard/fundraisers' },
  { label: 'Counselling', href: '/dashboard/counselling' },
];

export function MobileDrawer() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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
      <button
        type="button"
        aria-label="Open navigation menu"
        className={cn(
          'inline-flex items-center justify-center rounded-md p-2',
          'text-navy transition-colors hover:text-gold',
        )}
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {mounted &&
        createPortal(
          <>
            <div
              className={cn(
                'fixed inset-0 z-[9999] bg-black/40 transition-opacity duration-300',
                isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
              aria-hidden="true"
              onClick={() => setIsOpen(false)}
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className={cn(
                'fixed left-0 top-0 z-[9999] h-full w-72 bg-ivory shadow-xl',
                'transform transition-transform duration-300 ease-in-out',
                isOpen ? 'translate-x-0' : '-translate-x-full',
              )}
            >
              <div className="flex h-16 items-center justify-between border-b border-gold/30 px-6">
                <Wordmark size="md" />
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  className="inline-flex items-center justify-center rounded-md p-2 text-navy transition-colors hover:text-gold"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav aria-label="Navigation" className="flex-1 overflow-y-auto px-6 py-4">
                <ul className="space-y-0">
                  {publicLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block border-b border-gold/10 py-3 font-serif text-navy transition-colors hover:text-gold"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}

                  {isAuthenticated
                    ? authenticatedLinks.map((link, index) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className={cn(
                              'block py-3 font-serif text-navy transition-colors hover:text-gold',
                              index < authenticatedLinks.length - 1 && 'border-b border-gold/10',
                            )}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))
                    : null}
                </ul>
              </nav>

              <div className="mx-6 border-t border-gold/30" />

              <div className="px-6 py-4">
                {isAuthenticated ? (
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="w-full py-3 text-left font-serif text-navy transition-colors hover:text-gold"
                    >
                      Sign Out
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/sign-in"
                    className="block py-3 font-serif text-navy transition-colors hover:text-gold"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
