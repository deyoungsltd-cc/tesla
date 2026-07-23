import { Metadata } from 'next';

export const metadata: Metadata = { title: 'How to Invest | Tesla Prime Capital', description: 'Step-by-step guide on how to start investing with Tesla Prime Capital.' };

export default function HowToInvestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
