'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const faqs = [
  {
    category: 'Getting Started',
    items: [
      { q: 'What is Tesla Prime Capital?', a: 'Tesla Prime Capital is a professionally managed investment platform that offers daily returns through diversified strategies including equities, cryptocurrency, algorithmic trading, and sustainable energy investments. Our fund managers have decades of combined experience in financial markets, and our platform has been designed to make institutional-grade investment accessible to everyone, regardless of portfolio size. We operate with full transparency, real-time tracking, and regulatory compliance across all jurisdictions we serve.' },
      { q: 'How do I create an account?', a: 'Creating an account is straightforward and takes less than 2 minutes. Click the "Get Started" button on our homepage, fill in your name, email, and password. You will receive a 6-digit verification code via email to confirm your identity. Once verified, you can immediately log in and explore the platform. We recommend completing the KYC verification process early so you can unlock higher deposit limits and faster withdrawal processing times.' },
      { q: 'What is the minimum investment amount?', a: 'Our entry-level Basic plan starts at just $200, making professional investment management accessible to virtually everyone. The Silver plan requires a minimum of $5,000, Gold starts at $10,000, and our Platinum tier begins at $50,000. Each plan offers progressively higher daily return rates and additional perks such as priority support, dedicated account managers, zero-fee withdrawals, and VIP concierge services for our highest-tier investors.' },
      { q: 'Is Tesla Prime Capital available in my country?', a: 'Tesla Prime Capital serves investors in over 180 countries worldwide. Our platform is fully accessible via web browser on any device, including desktop, tablet, and mobile. We support multiple currencies and deposit methods including cryptocurrency and gift cards. If you can access our website and create an account, you can start investing regardless of your geographic location.' },
    ],
  },
  {
    category: 'Investment & Returns',
    items: [
      { q: 'How does Tesla Prime Capital generate returns?', a: 'Our returns are generated through a diversified portfolio managed by experienced fund managers. The strategies include algorithmic high-frequency trading on major exchanges, long-term positions in blue-chip technology stocks (with emphasis on Tesla and the clean energy sector), cryptocurrency arbitrage across multiple exchanges, sustainable energy infrastructure investments, and DeFi yield farming. By spreading risk across these diverse channels, we maintain consistent daily returns while minimizing exposure to any single market downturn.' },
      { q: 'What are the daily return rates?', a: 'Daily return rates vary by investment plan: Basic plan earns 0.5% daily, Silver plan earns 0.8% daily, Gold plan earns 1.2% daily, and Platinum plan earns 1.8% daily. Returns are credited to your account automatically every 24 hours. You can view your accumulated profits in real-time from your dashboard, and you have the flexibility to withdraw available profits at any time or reinvest them to compound your earnings.' },
      { q: 'Is my initial investment protected?', a: 'Yes, absolutely. Your principal investment is returned in full at the end of your chosen plan duration. We maintain a capital reserve fund specifically designated to ensure all investor principals are secured regardless of market conditions. This reserve is regularly audited and maintained at a ratio that exceeds our total outstanding investment obligations. Your capital safety is our top priority alongside generating consistent returns.' },
      { q: 'Can I reinvest my profits?', a: 'Yes, you can reinvest your earned profits at any time. Profits that have been credited to your available balance can be used to create new investments or added to existing ones. Many of our most successful investors compound their returns by regularly reinvesting their daily profits, which significantly accelerates portfolio growth over time through the power of compound interest.' },
    ],
  },
  {
    category: 'Deposits & Withdrawals',
    items: [
      { q: 'What deposit methods are accepted?', a: 'We currently accept two deposit methods: Cryptocurrency (Bitcoin, Ethereum, USDT, and other major tokens) and Gift Cards (Amazon, Apple, Google Play, Steam, and other major retailers). Cryptocurrency deposits are processed within minutes after blockchain confirmation. Gift card deposits are verified and credited within 1-3 business hours. We are continuously evaluating additional payment methods to expand options for our investors.' },
      { q: 'How do I withdraw my earnings?', a: 'Withdrawing is simple and fast. Navigate to the Withdraw section in your dashboard, enter the amount you wish to withdraw (up to your available balance), and provide your receiving wallet address or preferred payment method. For verified accounts, withdrawals are processed within minutes to a few hours. Larger withdrawals may require additional security verification for your protection. There are no hidden fees on withdrawals for Gold and Platinum plan investors.' },
      { q: 'Are there any withdrawal fees?', a: 'Withdrawal fees depend on your investment plan. Basic plan investors pay a nominal processing fee, while Silver plan investors enjoy reduced fees. Gold and Platinum plan investors benefit from zero withdrawal fees as one of their premium perks. All applicable fees are clearly displayed before you confirm any withdrawal transaction, so there are never any surprise charges.' },
    ],
  },
  {
    category: 'Security & Compliance',
    items: [
      { q: 'How secure is my account?', a: 'Security is our highest priority. Your account is protected by 256-bit SSL encryption, the same standard used by major banks and financial institutions. We implement multi-factor authentication (MFA), session management with automatic timeouts, and advanced fraud detection systems. All sensitive data is encrypted at rest and in transit. Our infrastructure is hosted on secure, redundant servers with 99.9% uptime guarantee, and we conduct regular third-party security audits.' },
      { q: 'What is KYC and why is it required?', a: 'KYC (Know Your Customer) is a standard verification process required by financial regulations. It involves submitting a government-issued ID and a proof of address document. Completing KYC verification unlocks higher deposit limits, enables faster withdrawal processing, and provides an additional layer of security for your account. The process is straightforward, and your documents are handled with the strictest confidentiality in compliance with data protection regulations.' },
      { q: 'What happens if the platform is hacked?', a: 'We maintain multiple layers of security including cold storage for the majority of cryptocurrency reserves, multi-signature transaction requirements, and real-time intrusion detection systems. In the unlikely event of a security breach, our reserve fund and insurance coverage would protect investor assets. We also maintain transparent communication with all investors regarding any security matters through our notification system.' },
    ],
  },
  {
    category: 'Referral Program',
    items: [
      { q: 'How does the referral program work?', a: 'Our referral program rewards you for inviting new investors to the platform. Each user receives a unique referral link that can be shared via email, social media, or messaging apps. When someone registers using your referral link and makes their first deposit, you earn a commission of up to 10% of their deposit amount. There is no limit to how many people you can refer, making this an excellent passive income opportunity alongside your investment returns.' },
      { q: 'When are referral commissions paid?', a: 'Referral commissions are credited to your account balance immediately after your referred user completes their first deposit. The commission is available in your balance right away and can be withdrawn or reinvested just like any other funds. You can track all your referral activity, including pending and completed commissions, in real-time from the Referral section of your dashboard.' },
    ],
  },
];

export default function FAQPage() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const toggleItem = (key: string) => {
    setOpenKey(prev => prev === key ? null : key);
  };

  return (
    <div className="page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative overflow-hidden">
      {/* Floating Orbs */}
      <div className="absolute top-10 -left-40 w-80 h-80 bg-[#CC0000]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-32 -right-40 w-96 h-96 bg-[#CC0000]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-64 h-64 bg-[#CC0000]/3 rounded-full blur-3xl pointer-events-none" />

      <FadeIn>
        <div className="text-center mb-14">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked <span className="text-[#CC0000]">Questions</span></h1>
          <p className="text-gray-400 max-w-xl mx-auto">Everything you need to know about investing with Tesla Prime Capital. Can&apos;t find what you&apos;re looking for? <Link href="/contact" className="text-[#CC0000] hover:underline">Contact our support team</Link>.</p>
        </div>
      </FadeIn>

      <div className="space-y-12">
        {faqs.map((section, sIdx) => (
          <FadeIn key={section.category} delay={sIdx * 80}>
            <div>
              <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#CC0000] rounded-full" />
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.items.map((item) => {
                  const key = `${section.category}-${item.q}`;
                  const isOpen = openKey === key;
                  return (
                    <div
                      key={key}
                      className={`bg-tesla-card border rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-[#CC0000]/50 shadow-[0_0_20px_rgba(204,0,0,0.1)]' : 'border-tesla-border'}`}
                    >
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full flex items-center justify-between p-5 cursor-pointer hover:bg-tesla-card-light transition-colors text-left"
                      >
                        <span className="text-white font-medium text-sm sm:text-base pr-4">{item.q}</span>
                        <svg
                          className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#CC0000]' : 'text-gray-500'}`}
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      <div className={`overflow-hidden transition-all duration-400 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-tesla-border pt-4">{item.a}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* CTA */}
      <FadeIn delay={400}>
        <div className="mt-16 text-center bg-tesla-card border border-tesla-border rounded-2xl p-8 animated-border">
          <h3 className="text-white font-bold text-lg mb-2">Still have questions?</h3>
          <p className="text-gray-400 text-sm mb-6">Our support team is available 24/7 to help you with any inquiries.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact" className="bg-[#CC0000] hover:bg-[#a30000] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors text-center">Contact Support</Link>
            <Link href="/register" className="border border-tesla-border hover:border-gray-500 text-gray-300 hover:text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors text-center">Create Account</Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}