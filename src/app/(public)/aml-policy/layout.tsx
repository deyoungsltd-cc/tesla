import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'AML Policy | TeslaPrime', description: 'TeslaPrime anti-money laundering policy and procedures.' };

export default function AMLLayout({ children }: { children: React.ReactNode }) {
  return children;
}
