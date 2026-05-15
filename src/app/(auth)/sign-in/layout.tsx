import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Grace Encounters',
  description: 'Sign in to your Grace Encounters account.',
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
