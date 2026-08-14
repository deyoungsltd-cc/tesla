import { type Metadata } from 'next';
import LandingPageClient from './LandingPageClient';
import StructuredData from '@/components/StructuredData';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://teslaprimecap.com';

export const metadata: Metadata = {
  title: 'TeslaPrime — Invest Smarter, Earn Daily Returns',
  description: 'Professionally managed investment platform with daily returns up to 1.8%. Trusted by 45,000+ investors worldwide. Start with as little as $200.',
  keywords: ['investment platform', 'daily returns', 'Tesla', 'crypto investment', 'managed portfolios', 'passive income', 'TSLA'],
  openGraph: {
    title: 'TeslaPrime — Invest Smarter, Earn Daily Returns',
    description: 'Professionally managed investment platform with daily returns up to 1.8%. Trusted by 45,000+ investors worldwide.',
    url: SITE_URL,
    siteName: 'TeslaPrime',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TeslaPrime — Invest Smarter, Earn Daily Returns',
    description: 'Professionally managed investment platform with daily returns up to 1.8%.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function LandingPage() {
  return (
    <>
      <StructuredData />
      <LandingPageClient />
    </>
  );
}
