import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'AML Policy | Tesla Prime Capital', description: 'Tesla Prime Capital anti-money laundering policy and procedures.' };

export default function AMLLayout({ children }: { children: React.ReactNode }) {
  return children;
}
