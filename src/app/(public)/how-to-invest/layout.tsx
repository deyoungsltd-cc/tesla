import { Metadata } from 'next';

export const metadata: Metadata = { title: 'How to Invest | TeslaPrime', description: 'Step-by-step guide on how to start investing with TeslaPrime.' };

export default function HowToInvestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
