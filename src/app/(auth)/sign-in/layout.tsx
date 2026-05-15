import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Light and Salt',
  description: 'Sign in to your Light and Salt account.',
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
