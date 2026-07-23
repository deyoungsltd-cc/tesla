import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Tesla Prime Capital',
  description: 'Learn about Tesla Prime Capital — our mission, team, and commitment to investor success.'
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
