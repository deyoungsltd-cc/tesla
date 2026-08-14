import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | TeslaPrime',
  description: 'Investment insights, market analysis, and financial education from TeslaPrime.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
