import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Investment Plans | TeslaPrime', description: 'Explore TeslaPrime investment plans with daily returns up to 1.8%.' };

export default function PlansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
