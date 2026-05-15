import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | Light and Salt',
  description: 'Set a new password for your Light and Salt account.',
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
