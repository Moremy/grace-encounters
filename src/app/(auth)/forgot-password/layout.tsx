import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | Light Bearers',
  description: 'Reset your Light Bearers account password.',
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
