'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import WithdrawalNotification from '@/components/WithdrawalNotification';

const TradingViewWidget = dynamic(() => import('@/components/TradingViewWidget'), { ssr: false });

function TeslaLogo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 342 35" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M0 .1a9.7 9.7 0 007 7h11l.5.1v27.6h6.8V7.3L26 7a9.7 9.7 0 007-7H0zm238.6 0h-6.8v34.8h6.8V.1zm-52.3 6.8c-5.3 0-9.7 2.1-12.9 6.2V.1h-6.8v34.8h6.8V19.5c0-7.4 3.8-12.4 10.2-12.4 5.8 0 9.3 4.3 9.3 11.2v16.6h6.8V17c0-6.3-1.8-10.1-4.5-12.6-2.6-2.3-5.4-2.5-8.9-2.5zM293 7.7c-9.7 0-17 7.3-17 18.2s7.3 18.2 17 18.2c9.4 0 16.7-7.3 16.7-18.2S302.4 7.7 293 7.7zm0 6.5c5.8 0 10.1 4.8 10.1 11.7 0 6.8-4.3 11.7-10.1 11.7S283 32.7 283 25.9c0-6.9 4.2-11.7 10-11.7zm-89.3-6.5h-7.5l-11.2 22.8V.1h-6.8v34.8h7.5l11.2-22.8v22.8h6.8V7.7z" fill="#CC0000"/>
    </svg>
  );
}

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

const plans = [
  { name: 'Basic', badge: 'STARTER', badgeColor: 'bg-gray-600', min: '$200', max: '$4,999', daily: '0.5%', duration: '30 Days', model: 'Model 3', image: 'https://cdn.motor1.com/images/mgl/3r5Xj/s1/tesla-model-3.jpg', features: ['Daily profit accrual', 'Capital return included', '24/7 support access'] },
  { name: 'Silver', badge: 'POPULAR', badgeColor: 'bg-[#CC0000]', min: '$5,000', max: '$9,999', daily: '0.8%', duration: '21 Days', model: 'Model Y', image: 'https://cdn.motor1.com/images/mgl/8N3Eo/s1/tesla-model-y.jpg', features: ['Higher daily returns', 'Priority withdrawals', 'Dedicated account manager'] },
  { name: 'Gold', badge: 'PREMIUM', badgeColor: 'bg-amber-600', min: '$10,000', max: '$49,999', daily: '1.2%', duration: '14 Days', model: 'Model S', image: 'https://cdn.motor1.com/images/mgl/MY1YN/s1/tesla-model-s.jpg', features: ['Premium daily rates', 'Instant profit withdrawal', 'Portfolio insurance'] },
  { name: 'Platinum', badge: 'ELITE', badgeColor: 'bg-purple-600', min: '$50,000', max: '$100,000', daily: '1.8%', duration: '7 Days', model: 'Model X', image: 'https://cdn.motor1.com/images/mgl/Q0KNR/s1/tesla-model-x.jpg', features: ['Maximum daily returns', 'Zero-fee withdrawals', 'VIP concierge service'] },
];

const stats = [
  { value: '$2.4B+', label: 'Assets Under Management' },
  { value: '45,000+', label: 'Active Investors' },
  { value: '99.9%', label: 'Platform Uptime' },
  { value: '24/7', label: 'Expert Support' },
];

const whyUsItems = [
  { title: 'Managed Portfolios', desc: 'Expert fund managers allocate your capital across diversified strategies for optimal risk-adjusted returns.' },
  { title: 'Daily Profit Accrual', desc: 'Transparent, real-time profit tracking and instant crediting to your account every day.' },
  { title: 'Secure & Regulated', desc: 'Bank-grade encryption, multi-factor authentication, and full regulatory compliance.' },
  { title: 'Instant Withdrawals', desc: 'Access your funds whenever you need. Processed within minutes, not days.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-tesla-dark text-white">
      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-hero">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-[#CC0000]/10 border border-[#CC0000]/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-[#CC0000] rounded-full animate-pulse" />
                <span className="text-[#CC0000] text-sm font-medium">Trusted by 45,000+ investors worldwide</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
                Invest Smarter.<br />
                <span className="text-[#CC0000]">Earn Daily Returns.</span>
              </h1>
              <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
                Tesla offers professionally managed investment plans with daily returns up to 1.8%. Backed by real performance data.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="bg-[#CC0000] hover:bg-[#a30000] text-white font-semibold px-8 py-3.5 rounded-lg text-base transition-all duration-300 text-center">
                  Start Investing Now
                </Link>
                <Link href="/plans" className="border border-tesla-border hover:border-gray-500 text-gray-300 hover:text-white font-semibold px-8 py-3.5 rounded-lg text-base transition-all duration-300 text-center">
                  View Plans
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-tesla-border bg-tesla-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{s.value}</div>
                  <div className="text-gray-500 text-sm mt-1">{s.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Live TSLA Chart */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-tesla-card/30">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">LIVE MARKET DATA</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">TSLA <span className="text-[#CC0000]">Live Chart</span></h2>
              <p className="text-gray-400 max-w-xl mx-auto">Real-time Tesla stock performance powered by TradingView.</p>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="dash-card !p-0 overflow-hidden">
              <div className="px-5 py-3 border-b border-tesla-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold">NASDAQ:TSLA</span>
                  <span className="text-gray-500 text-sm">Tesla, Inc.</span>
                </div>
                <span className="text-xs text-gray-500">Powered by TradingView</span>
              </div>
              <TradingViewWidget />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Investment Plans */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Investment <span className="text-[#CC0000]">Plans</span></h2>
            <p className="text-gray-400 max-w-xl mx-auto">Choose the plan that fits your investment goals. Higher tiers unlock higher daily returns.</p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <FadeIn key={i} delay={i * 120}>
              <div className="bg-tesla-card border border-tesla-border rounded-2xl overflow-hidden hover:border-[#CC0000]/50 transition-all duration-500 hover:-translate-y-1 group">
                <div className="relative h-44 overflow-hidden">
                  <img src={plan.image} alt={plan.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-tesla-card via-transparent to-transparent" />
                  <span className={`absolute top-3 left-3 ${plan.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>{plan.badge}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white">{plan.name} <span className="text-gray-500 text-sm font-normal">&middot; {plan.model}</span></h3>
                    <span className="text-[#CC0000] text-xl font-bold">{plan.daily}</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-1">{plan.min} — {plan.max}</p>
                  <p className="text-gray-500 text-sm mb-4">Duration: {plan.duration}</p>
                  <ul className="space-y-2 mb-5">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-gray-400 text-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block w-full bg-[#CC0000] hover:bg-[#a30000] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm text-center">
                    Invest Now
                  </Link>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/plans" className="text-[#CC0000] hover:underline text-sm font-medium">View Full Plan Details &rarr;</Link>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-tesla-card/30">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why <span className="text-[#CC0000]">Choose Us</span></h2>
              <p className="text-gray-400 max-w-xl mx-auto">Cutting-edge technology with institutional-grade fund management.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUsItems.map((item, i) => (
              <FadeIn key={i} delay={i * 120}>
                <div className="bg-tesla-card border border-tesla-border rounded-2xl p-6 hover:border-[#CC0000]/40 transition-all duration-300">
                  <div className="w-12 h-12 bg-[#CC0000]/10 rounded-xl flex items-center justify-center mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/about" className="text-[#CC0000] hover:underline text-sm font-medium">Learn More About Us &rarr;</Link>
          </div>
        </div>
      </section>

      {/* How to Invest Quick Steps */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How to <span className="text-[#CC0000]">Get Started</span></h2>
            <p className="text-gray-400 max-w-xl mx-auto">Start earning daily returns in just three simple steps.</p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Create an Account', desc: 'Sign up with your email, verify your identity, and secure your account with a strong password. The entire process takes under 2 minutes.' },
            { step: '02', title: 'Choose a Plan', desc: 'Select from our four investment tiers — Basic, Silver, Gold, or Platinum — each offering different daily returns and durations.' },
            { step: '03', title: 'Earn Daily Returns', desc: 'Watch your capital grow with daily profit accrual. Withdraw your earnings or reinvest them to compound your returns at any time.' },
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 150}>
              <div className="relative bg-tesla-card border border-tesla-border rounded-2xl p-6 hover:border-[#CC0000]/40 transition-all duration-300">
                <span className="text-[#CC0000]/20 text-6xl font-extrabold absolute top-4 right-4">{item.step}</span>
                <h3 className="text-white font-bold text-lg mb-2 relative">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed relative">{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/how-to-invest" className="text-[#CC0000] hover:underline text-sm font-medium">Read the Full Investment Guide &rarr;</Link>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-tesla-card/30">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked <span className="text-[#CC0000]">Questions</span></h2>
              <p className="text-gray-400">Get answers to the most common questions about our platform.</p>
            </div>
          </FadeIn>
          <div className="space-y-3">
            {[
              { q: 'How does Tesla generate returns?', a: 'Our fund managers deploy capital across diversified strategies including equities, crypto assets, and algorithmic trading for consistent daily returns.' },
              { q: 'Is my initial investment protected?', a: 'Yes, your principal is returned in full at the end of your plan duration. We maintain a capital reserve fund to ensure all investor principals are secured.' },
              { q: 'How do I withdraw my earnings?', a: 'Navigate to Withdraw in your dashboard, enter the amount and wallet address. Withdrawals are processed within minutes for verified accounts.' },
            ].map((faq, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="bg-tesla-card border border-tesla-border rounded-xl p-5">
                  <p className="text-white font-medium text-sm sm:text-base mb-2">{faq.q}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/faq" className="text-[#CC0000] hover:underline text-sm font-medium">View All FAQ &rarr;</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#CC0000]/20 via-tesla-card to-tesla-card border border-[#CC0000]/20 rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-8">Join 45,000+ investors earning daily returns. Your financial future starts with a single decision.</p>
            <Link href="/register" className="inline-block bg-[#CC0000] hover:bg-[#a30000] text-white font-semibold px-8 py-3.5 rounded-lg text-base transition-all duration-300">
              Create Free Account
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* Live Withdrawal Notifications */}
      <WithdrawalNotification />
    </div>
  );
}
