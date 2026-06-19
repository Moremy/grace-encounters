import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | Light Bearers',
  description: 'Set a new password for your Light Bearers account.',
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
