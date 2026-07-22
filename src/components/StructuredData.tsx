export default function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'Tesla Prime Capital',
    url: 'https://teslapremiumfinance.com',
    logo: 'https://teslapremiumfinance.com/logo.png',
    description: 'Professionally managed investment platform offering daily returns up to 1.8% across diversified strategies.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'London',
      addressCountry: 'GB',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@teslaprimecapital.com',
      contactType: 'customer support',
      availableLanguage: ['English'],
    },
    sameAs: [
      'https://twitter.com/TeslaPrimeCap',
      'https://linkedin.com/company/tesla-prime-capital',
      'https://t.me/TeslaPrimeCapital',
    ],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tesla Prime Capital',
    url: 'https://teslapremiumfinance.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://teslapremiumfinance.com/faq?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does Tesla Prime Capital generate returns?',
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
