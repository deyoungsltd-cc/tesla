import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Investment Plans | Tesla Prime Capital', description: 'Explore Tesla Prime Capital investment plans with daily returns up to 1.8%.' };

export default function PlansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
