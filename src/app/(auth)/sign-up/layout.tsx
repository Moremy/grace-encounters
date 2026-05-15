import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | Grace Encounters',
  description: 'Create your Grace Encounters account.',
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
