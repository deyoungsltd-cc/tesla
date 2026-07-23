import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Risk Disclosure | Tesla Prime Capital', description: 'Tesla Prime Capital risk disclosure — understand the risks before investing.' };

export default function RiskLayout({ children }: { children: React.ReactNode }) {
  return children;
}
