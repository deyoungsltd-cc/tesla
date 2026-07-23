import { Metadata } from 'next';

export const metadata: Metadata = { title: 'FAQ | Tesla Prime Capital', description: 'Frequently asked questions about Tesla Prime Capital investment platform.' };

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
