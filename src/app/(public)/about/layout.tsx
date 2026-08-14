import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | TeslaPrime',
  description: 'Learn about TeslaPrime — our mission, team, and commitment to investor success.'
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
