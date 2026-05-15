import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Magic Link | Grace Encounters',
  description: 'Sign in with a magic link sent to your email.',
};

export default function MagicLinkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
