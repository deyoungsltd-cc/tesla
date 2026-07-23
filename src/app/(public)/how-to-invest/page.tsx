'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';

function FadeIn({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
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

const steps = [
  {
    step: '1',
    title: 'Create & Verify Your Account',
    desc: 'Begin by clicking the "Get Started" button on our homepage. You will need to provide your first name, last name, email address, and create a secure password with at least 8 characters. After submitting the registration form, a 6-digit verification code will be sent to your email address. Enter this code on the verification screen to activate your account. The entire registration and verification process typically takes under 2 minutes.',
    tips: ['Use a strong, unique password that you do not use on other platforms', 'Make sure your email address is correct — this is where your verification code will be sent', 'If you have a referral code from a friend, enter it during registration to earn bonus rewards'],
  },
  {
    step: '2',
    title: 'Complete KYC Verification (Recommended)',
    desc: 'While basic investing is available without KYC, completing the verification process unlocks significantly higher deposit limits and faster withdrawal processing. Navigate to the KYC section in your dashboard and upload a clear photo of your government-issued ID (passport, driver\'s license, or national ID) and a recent utility bill or bank statement showing your name and address. Verification is typically completed within 24 hours.',
    tips: ['Ensure all documents are clearly visible and not expired', 'Accepted proofs of address include utility bills, bank statements, or tax documents dated within the last 3 months', 'KYC verification is a one-time process and unlocks your full account capabilities'],
  },
  {
    step: '3',
    title: 'Fund Your Account',
    desc: 'Go to the Deposit section in your dashboard to add funds to your account. We accept cryptocurrency (Bitcoin, Ethereum, USDT, and other major tokens) and gift cards from major retailers including Amazon, Apple, Google Play, and Steam. For cryptocurrency, simply copy the provided wallet address and transfer from your personal wallet. For gift cards, enter the card details and our system will verify and credit the value to your account. Crypto deposits are confirmed within minutes after blockchain confirmations.',
    tips: ['Double-check the wallet address before sending cryptocurrency — transactions on the blockchain cannot be reversed', 'Start with the minimum amount for your chosen plan to familiarize yourself with the platform', 'Gift card values are credited at market rate with minimal processing fees'],
  },
  {
    step: '4',
    title: 'Select Your Investment Plan',
    desc: 'Navigate to the Investments section to browse available plans. Our four tiers — Basic ($200-$4,999, 0.5% daily), Silver ($5,000-$9,999, 0.8% daily), Gold ($10,000-$49,999, 1.2% daily), and Platinum ($50,000-$100,000, 1.8% daily) — cater to different investment goals and risk appetites. Each plan has a specific duration ranging from 7 to 30 days. Select the plan that aligns with your investment capital and return expectations, then confirm the investment.',
    tips: ['Higher-tier plans offer better daily return rates and additional premium perks', 'Your principal is returned in full at the end of the plan duration', 'You can have multiple active investments across different plans simultaneously'],
  },
  {
    step: '5',
    title: 'Track Your Returns & Withdraw',
    desc: 'Once your investment is active, daily returns are automatically credited to your account balance. You can monitor your total balance, available funds, locked funds (active investments), and accumulated profits in real-time from your dashboard. When you want to withdraw, go to the Withdraw section, enter the amount (up to your available balance), provide your receiving wallet address, and confirm. Verified accounts enjoy withdrawal processing within minutes.',
    tips: ['Profits are credited daily and can be withdrawn or reinvested at any time', 'Reinvesting your daily profits maximizes compound growth over time', 'Gold and Platinum plan investors enjoy zero withdrawal fees'],
  },
];

export default function HowToInvestPage() {
  return (
    <div className="page-enter relative overflow-hidden">
      {/* Floating Orbs */}
      <div className="float-orb float-orb-md" style={{ top: '5%', right: '-8%' }} />
      <div className="float-orb float-orb-lg" style={{ bottom: '15%', left: '-10%' }} />
      <div className="float-orb float-orb-sm" style={{ top: '60%', right: '-5%' }} />

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
        <FadeIn>
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 heading-gradient">How to Invest</h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">A complete guide to getting started with Tesla Prime Capital and maximizing your investment returns.</p>
          </div>
        </FadeIn>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="section-divider" />
      </div>

      {/* Steps with vertical timeline */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[23px] sm:left-[27px] top-0 bottom-0 w-px bg-gradient-to-b from-[#CC0000]/50 via-[#CC0000]/20 to-transparent" />

          <div className="space-y-14">
            {steps.map((item, idx) => (
              <FadeIn key={item.step} delay={idx * 100}>
                <div className="relative dash-card card-shine noise-overlay bg-tesla-card border border-tesla-border rounded-2xl p-7 sm:p-9 hover:border-[#CC0000]/20 transition-all duration-500">
                  <div className="flex items-start gap-5 sm:gap-7">
                    <div className="relative shrink-0 z-10 w-12 h-12 bg-[#CC0000] rounded-xl flex items-center justify-center text-white font-bold text-lg pulse-ring shadow-[0_0_20px_rgba(204,0,0,0.3)]">
                      {item.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-white font-bold text-lg sm:text-xl mb-3">{item.title}</h2>
                      <p className="text-gray-400 text-sm leading-relaxed mb-5">{item.desc}</p>
                      <div className="bg-[#1a1a1a] border border-tesla-border rounded-xl p-5">
                        <p className="text-[#CC0000] text-xs font-bold uppercase tracking-wider mb-3">Pro Tips</p>
                        <ul className="space-y-2">
                          {item.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-gray-500 text-xs leading-relaxed">
                              <svg className="shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="section-divider" />
      </div>

      {/* Referral Bonus Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
        <FadeIn delay={500}>
          <div className="dash-card card-shine noise-overlay bg-gradient-to-br from-[#CC0000]/10 via-tesla-card to-tesla-card border border-[#CC0000]/20 rounded-2xl p-10 animated-border">
            <h2 className="text-white font-bold text-xl mb-3">Boost Your Earnings with Referrals</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">After setting up your investment, share your unique referral link with friends and family. When they register and deposit, you earn up to 10% commission on their first deposit. There is no limit to the number of people you can refer.</p>
            <Link href="/plans" className="btn-red pulse-ring magnetic-hover inline-flex items-center gap-2">
              View Investment Plans
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
