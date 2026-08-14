import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Risk Disclosure | TeslaPrime', description: 'TeslaPrime risk disclosure — understand the risks before investing.' };

export default function RiskLayout({ children }: { children: React.ReactNode }) {
  return children;
}
