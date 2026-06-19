import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Light Bearers',
  description: 'Sign in to your Light Bearers account.',
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
