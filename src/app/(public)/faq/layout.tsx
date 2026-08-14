import { Metadata } from 'next';

export const metadata: Metadata = { title: 'FAQ | TeslaPrime', description: 'Frequently asked questions about TeslaPrime investment platform.' };

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
