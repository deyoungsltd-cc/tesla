'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import WithdrawalNotification from '@/components/WithdrawalNotification';

const TradingViewWidget = dynamic(() => import('@/components/TradingViewWidget'), { ssr: false });
const TickerTapeWidget = dynamic(() => import('@/components/TickerTapeWidget'), { ssr: false });

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

function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !hasAnimated) { setHasAnimated(true); } }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasAnimated]);

  const numericPart = parseFloat(value.replace(/[^0-9.]/g, ''));
  const prefix = value.match(/^[^0-9]*/)?.[0] || '';
  const decimalPlaces = value.includes('.') ? value.split('.')[1]?.replace(/[^0-9]/g, '').length || 0 : 0;

  useEffect(() => {
    if (!hasAnimated || !ref.current) return;
    const duration = 2000;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numericPart * eased;
      if (ref.current) {
        let display: string;
        if (decimalPlaces > 0) {
          display = current.toFixed(decimalPlaces);
        } else if (numericPart >= 1000) {
          display = Math.round(current).toLocaleString();
        } else {
          display = Math.round(current).toString();
        }
        ref.current.textContent = prefix + display + suffix;
      }
      if (progress >= 1) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [hasAnimated, numericPart, prefix, suffix, decimalPlaces]);

  return <span ref={ref} className="count-up">{prefix}0{suffix}</span>;
}

const plans = [
  { name: 'Basic', badge: 'STARTER', badgeBg: 'bg-gradient-to-r from-gray-600 to-gray-700', min: '$200', max: '$4,999', daily: '0.5%', duration: '30 Days', model: 'Model 3', image: 'https://tesla-cdn.purplecar.io/2024/model3/hero/M3_Hero_Desktop_Dynamic.jpg', features: ['Daily profit accrual', 'Capital return included', '24/7 support access'] },
  { name: 'Silver', badge: 'MOST POPULAR', badgeBg: 'bg-gradient-to-r from-[#CC0000] to-[#ff1a1a]', min: '$5,000', max: '$9,999', daily: '0.8%', duration: '21 Days', model: 'Model Y', image: 'https://tesla-cdn.purplecar.io/2024/modely/hero/MY_Hero_Desktop_Dynamic.jpg', features: ['Higher daily returns', 'Priority withdrawals', 'Dedicated account manager'], popular: true },
  { name: 'Gold', badge: 'PREMIUM', badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-500', min: '$10,000', max: '$49,999', daily: '1.2%', duration: '14 Days', model: 'Model S', image: 'https://tesla-cdn.purplecar.io/2024/modelss/hero/MS_Hero_Desktop_Dynamic.jpg', features: ['Premium daily rates', 'Instant profit withdrawal', 'Portfolio insurance'] },
  { name: 'Platinum', badge: 'ELITE', badgeBg: 'bg-gradient-to-r from-purple-500 to-indigo-500', min: '$50,000', max: '$100,000', daily: '1.8%', duration: '7 Days', model: 'Model X', image: 'https://tesla-cdn.purplecar.io/2024/modelx/hero/MX_Hero_Desktop_Dynamic.jpg', features: ['Maximum daily returns', 'Zero-fee withdrawals', 'VIP concierge service'] },
];

const stats = [
  { value: '$2.4B', label: 'Assets Under Management', suffix: '+' },
  { value: '45000', label: 'Active Investors', suffix: '+' },
  { value: '99.9', label: 'Platform Uptime', suffix: '%' },
  { value: '24', label: 'Expert Support', suffix: '/7' },
];

const whyUsItems = [
  { title: 'Managed Portfolios', desc: 'Expert fund managers allocate your capital across diversified strategies for optimal risk-adjusted returns.', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { title: 'Daily Profit Accrual', desc: 'Transparent, real-time profit tracking and instant crediting to your account every single day.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  { title: 'Secure & Regulated', desc: 'Bank-grade encryption, multi-factor authentication, and full regulatory compliance across all jurisdictions.', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { title: 'Instant Withdrawals', desc: 'Access your funds whenever you need. Processed within minutes, not days.', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
];

export default function LandingPageClient() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-tesla-dark text-white page-enter">
      {/* Scroll Progress */}
      <ScrollProgress />

      {/* Ticker Tape */}
      <TickerTapeWidget />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Floating orbs */}
        <div className="float-orb float-orb-lg" style={{ top: '10%', left: '-5%' }} />
        <div className="float-orb float-orb-md" style={{ top: '30%', right: '-3%' }} />
        <div className="float-orb float-orb-sm" style={{ bottom: '10%', left: '40%' }} />

        <div className="bg-gradient-hero relative z-10">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-[#CC0000]/10 border border-[#CC0000]/20 rounded-full px-4 py-1.5 mb-6 noise-overlay">
                <span className="glow-dot" />
                <span className="text-[#CC0000] text-sm font-medium">Trusted by 45,000+ investors worldwide</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6 text-shadow-subtle">
                Invest Smarter.<br />
                <span className="gradient-text-animated">Earn Daily Returns.</span>
              </h1>
              <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
                Tesla Prime Capital offers professionally managed investment plans with daily returns up to <span className="text-white font-semibold">1.8%</span>. Backed by real performance data and institutional-grade security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="btn-red text-base pulse-ring magnetic-hover">
                  Start Investing Now
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
                <Link href="/plans" className="btn-ghost text-base magnetic-hover">
                  View Plans
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* Stats Bar */}
      <section className="border-y border-tesla-border bg-tesla-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <FadeIn key={i} delay={i * 120}>
                <div className="text-center group">
                  <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-gray-500 text-sm font-medium">{s.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Live TSLA Chart */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-tesla-card/30 relative overflow-hidden">
        <div className="float-orb float-orb-md" style={{ top: '-10%', right: '10%' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="glow-dot" />
                <span className="text-green-400 text-sm font-semibold tracking-wide">LIVE MARKET DATA</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 heading-gradient">TSLA Live Chart</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Real-time Tesla stock performance powered by TradingView. Track the market that drives our investment strategy.</p>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="dash-card card-shine noise-overlay !p-0 overflow-hidden animated-border">
              <div className="px-5 py-3 border-b border-tesla-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold">NASDAQ:TSLA</span>
                  <span className="text-gray-500 text-sm">Tesla, Inc.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="glow-dot" />
                  <span className="text-xs text-gray-500">Live</span>
                </div>
              </div>
              <TradingViewWidget />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* Investment Plans */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
        <div className="float-orb float-orb-lg" style={{ bottom: '-15%', left: '-10%' }} />
        <div className="relative z-10">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 heading-gradient">Investment Plans</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Choose the plan that fits your investment goals. Higher tiers unlock higher daily returns and premium perks.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => (
              <FadeIn key={i} delay={i * 120}>
                <div className={`plan-card glass-card card-shine group tilt-card ${plan.popular ? 'ring-1 ring-[#CC0000]/40' : ''}`}>
                  <div className="relative h-48 overflow-hidden">
                    <img src={plan.image} alt={`${plan.model} - ${plan.name} Plan`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1e] via-[#1e1e1e]/50 to-transparent" />
                    <span className={`absolute top-3 left-3 ${plan.badgeBg} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>{plan.badge}</span>
                    {plan.popular && (
                      <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CC0000] to-transparent" />
                    )}
                  </div>
                  <div className="p-5 bg-gradient-card-glow">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                        <span className="text-gray-500 text-xs font-medium">{plan.model}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#CC0000] text-2xl font-black">{plan.daily}</span>
                        <span className="text-gray-500 text-xs block">daily</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-4 py-2.5 px-3 bg-black/30 rounded-lg border border-white/5">
                      <span className="text-gray-400">{plan.min} — {plan.max}</span>
                      <span className="text-gray-500">{plan.duration}</span>
                    </div>
                    <ul className="space-y-2.5 mb-5">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2 text-gray-300 text-sm">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link href="/register" className={`block w-full text-center text-sm font-semibold py-3 rounded-xl transition-all duration-300 ${plan.popular ? 'btn-red pulse-ring' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-[#CC0000]/30'}`}>
                      Invest Now
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </Link>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/plans" className="inline-flex items-center gap-2 text-[#CC0000] hover:text-[#ff1a1a] text-sm font-semibold transition-colors">
              View Full Plan Details with ROI Calculator
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* Why Choose Us */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-tesla-card/30 relative overflow-hidden">
        <div className="float-orb float-orb-sm" style={{ top: '20%', left: '5%' }} />
        <div className="float-orb float-orb-md" style={{ bottom: '10%', right: '5%' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 heading-gradient">Why Choose Us</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Cutting-edge technology with institutional-grade fund management. Every feature designed for your success.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUsItems.map((item, i) => (
              <FadeIn key={i} delay={i * 120}>
                <div className="dash-card card-shine noise-overlay p-6 group tilt-card relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CC0000]/0 to-transparent group-hover:via-[#CC0000]/60 transition-all duration-500" />
                  <div className="w-14 h-14 bg-gradient-to-br from-[#CC0000]/20 to-[#CC0000]/5 rounded-2xl flex items-center justify-center mb-5 group-hover:shadow-[0_0_25px_rgba(204,0,0,0.3)] transition-all duration-500 group-hover:scale-110">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/about" className="inline-flex items-center gap-2 text-[#CC0000] hover:text-[#ff1a1a] text-sm font-semibold transition-colors">
              Learn More About Our Company
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* How to Invest Quick Steps */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
        <div className="float-orb float-orb-lg" style={{ top: '-10%', right: '-10%' }} />
        <div className="relative z-10">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 heading-gradient">How to Get Started</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Start earning daily returns in just three simple steps. No complicated setup, no hidden requirements.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-[#CC0000]/20 via-[#CC0000]/40 to-[#CC0000]/20" />

            {[
              { step: '01', title: 'Create an Account', desc: 'Sign up with your email, verify your identity with a 6-digit code, and secure your account with a strong password. The entire process takes under 2 minutes.', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a3 3 0 100-6 3 3 0 000 6z' },
              { step: '02', title: 'Choose a Plan', desc: 'Select from our four investment tiers — Basic, Silver, Gold, or Platinum — each offering different daily returns, durations, and premium perks.', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { step: '03', title: 'Earn Daily Returns', desc: 'Watch your capital grow with daily profit accrual. Withdraw your earnings or reinvest them to compound your returns at any time.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 150}>
                <div className="dash-card card-shine p-6 relative group">
                  <span className="text-[#CC0000]/8 text-7xl font-black absolute top-2 right-4 group-hover:text-[#CC0000]/15 transition-colors select-none">{item.step}</span>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#CC0000]/20 to-transparent flex items-center justify-center mb-4 relative">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2 relative">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed relative">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/how-to-invest" className="inline-flex items-center gap-2 text-[#CC0000] hover:text-[#ff1a1a] text-sm font-semibold transition-colors">
              Read the Full Investment Guide
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* FAQ Preview — Accordion */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-tesla-card/30">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 heading-gradient">Frequently Asked Questions</h2>
              <p className="text-gray-400">Get answers to the most common questions about our platform.</p>
            </div>
          </FadeIn>
          <div className="space-y-3">
            {[
              { q: 'How does Tesla Prime Capital generate returns?', a: 'Our fund managers deploy capital across diversified strategies including equities, crypto assets, algorithmic trading, and sustainable energy investments. By spreading risk across multiple asset classes and employing AI-driven analytics, we maintain consistent daily returns while minimizing exposure to any single market downturn.' },
              { q: 'Is my initial investment protected?', a: 'Yes, your principal is returned in full at the end of your plan duration. We maintain a capital reserve fund specifically designated to ensure all investor principals are secured regardless of market conditions. This reserve is regularly audited and maintained at a ratio that exceeds our total outstanding investment obligations.' },
              { q: 'How do I withdraw my earnings?', a: 'Navigate to Withdraw in your dashboard, enter the amount and your receiving wallet address. For verified accounts, withdrawals are processed within minutes. Gold and Platinum plan investors enjoy zero withdrawal fees. All applicable fees are clearly displayed before you confirm any transaction.' },
              { q: 'What deposit methods are accepted?', a: 'We accept Cryptocurrency (Bitcoin, Ethereum, USDT, and other major tokens) and Gift Cards (Amazon, Apple, Google Play, Steam, and other major retailers). Crypto deposits are confirmed within minutes after blockchain confirmation. Gift card deposits are verified and credited within 1-3 business hours.' },
              { q: 'How does the referral program work?', a: 'Share your unique referral link with friends. When they register and make their first deposit, you earn up to 10% commission on their deposit amount. There is no limit to the number of people you can refer, and commissions are credited instantly to your available balance.' },
            ].map((faq, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div
                  className={`bg-tesla-card border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${faqOpen === i ? 'border-[#CC0000]/30 shadow-[0_0_20px_rgba(204,0,0,0.08)]' : 'border-tesla-border hover:border-white/10'}`}
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                >
                  <div className="flex items-center justify-between p-5">
                    <p className="text-white font-medium text-sm sm:text-base pr-4">{faq.q}</p>
                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${faqOpen === i ? 'bg-[#CC0000]/20 rotate-180' : 'bg-white/5'}`}>
                      <svg className="w-4 h-4 text-gray-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                    </div>
                  </div>
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${faqOpen === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-tesla-border pt-4">{faq.a}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/faq" className="inline-flex items-center gap-2 text-[#CC0000] hover:text-[#ff1a1a] text-sm font-semibold transition-colors">
              View All 15+ FAQ Questions
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="float-orb float-orb-lg" style={{ top: '-20%', left: '30%' }} />
        <FadeIn>
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="animated-border">
              <div className="relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#CC0000]/15 via-[#CC0000]/5 to-transparent rounded-2xl" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#CC0000]/8 rounded-full blur-[120px]" />
                <div className="relative bg-tesla-dark/90 rounded-2xl p-8 sm:p-14 text-center noise-overlay">
                  <div className="inline-flex items-center gap-2 bg-[#CC0000]/10 border border-[#CC0000]/20 rounded-full px-4 py-1.5 mb-6">
                    <span className="glow-dot" />
                    <span className="text-[#CC0000] text-sm font-medium">Join 45,000+ investors today</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4 relative">Ready to Start <span className="gradient-text-animated">Earning</span>?</h2>
                  <p className="text-gray-400 max-w-lg mx-auto mb-8 relative">Your financial future starts with a single decision. Create a free account and start earning daily returns in under 5 minutes.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/register" className="btn-red text-base pulse-ring magnetic-hover">
                      Create Free Account
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </Link>
                    <Link href="/contact" className="btn-ghost text-base magnetic-hover">
                      Talk to Our Team
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Live Withdrawal Notifications */}
      <WithdrawalNotification />
    </div>
  );
}

/* Scroll Progress Bar Component */
function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${progress}%` }} />;
}
