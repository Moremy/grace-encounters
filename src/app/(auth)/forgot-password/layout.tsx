import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | Grace Encounters',
  description: 'Reset your Grace Encounters account password.',
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
