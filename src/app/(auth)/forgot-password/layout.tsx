import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | Light and Salt',
  description: 'Reset your Light and Salt account password.',
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
