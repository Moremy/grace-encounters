import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | Grace Encounters',
  description: 'Set a new password for your Grace Encounters account.',
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
