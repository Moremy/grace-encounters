import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | Light and Salt',
  description: 'Create your Light and Salt account.',
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
