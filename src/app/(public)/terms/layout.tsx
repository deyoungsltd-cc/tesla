import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service | Tesla Prime Capital', description: 'Tesla Prime Capital terms of service — rules and conditions for using our platform.' };

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
