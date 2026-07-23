import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | Tesla Prime Capital',
  description: 'Investment insights, market analysis, and financial education from Tesla Prime Capital.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
