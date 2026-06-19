import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | Light Bearers',
  description: 'Create your Light Bearers account.',
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
