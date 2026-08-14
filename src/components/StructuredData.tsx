export default function StructuredData() {
  const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://teslaprimecap.com';
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'TeslaPrime',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Professionally managed investment platform offering daily returns up to 1.8% across diversified strategies.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'London',
      addressCountry: 'GB',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'teslaprimesupportt@gmail.com',
      contactType: 'customer support',
      availableLanguage: ['English'],
    },
    sameAs: [
      'https://twitter.com/TeslaPrimeCap',
      'https://linkedin.com/company/teslaprime',
      'https://t.me/TeslaPrime',
    ],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TeslaPrime',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/faq?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does TeslaPrime generate returns?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our fund managers deploy capital across diversified strategies including equities, crypto assets, and algorithmic trading for consistent daily returns.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my initial investment protected?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, your principal is returned in full at the end of your plan duration. We maintain a capital reserve fund to ensure all investor principals are secured.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I withdraw my earnings?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Navigate to Withdraw in your dashboard, enter the amount and wallet address. Withdrawals are processed within minutes for verified accounts.',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}
