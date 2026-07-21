'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const TradingViewWidget = dynamic(() => import('@/components/TradingViewWidget'), { ssr: false });

function TeslaLogo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 8C50 8 30 8 20 12L16 40C16 40 10 72 8 88H28L32 56H48V88H52V56H68L72 88H92C92 88 84 40 84 40L80 12C70 8 50 8 50 8Z" fill="#CC0000" />
      <rect x="36" y="4" width="28" height="8" rx="4" fill="#CC0000" />
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
  { name: 'Basic', badge: 'STARTER', badgeColor: 'bg-gray-600', min: '$200', max: '$4,999', daily: '0.5%', duration: '30 Days', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&h=400&fit=crop', features: ['Daily profit accrual', 'Capital return included', '24/7 support access'] },
  { name: 'Silver', badge: 'POPULAR', badgeColor: 'bg-[#CC0000]', min: '$5,000', max: '$9,999', daily: '0.8%', duration: '21 Days', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop', features: ['Higher daily returns', 'Priority withdrawals', 'Dedicated account manager'] },
  { name: 'Gold', badge: 'PREMIUM', badgeColor: 'bg-amber-600', min: '$10,000', max: '$49,999', daily: '1.2%', duration: '14 Days', image: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=600&h=400&fit=crop', features: ['Premium daily rates', 'Instant profit withdrawal', 'Portfolio insurance'] },
  { name: 'Platinum', badge: 'ELITE', badgeColor: 'bg-purple-600', min: '$50,000', max: '$100,000', daily: '1.8%', duration: '7 Days', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&h=400&fit=crop', features: ['Maximum daily returns', 'Zero-fee withdrawals', 'VIP concierge service'] },
];

const stats = [
  { value: '$2.4B+', label: 'Assets Under Management' },
  { value: '45,000+', label: 'Active Investors' },
  { value: '99.9%', label: 'Platform Uptime' },
  { value: '24/7', label: 'Expert Support' },
];

const faqs = [
  { q: 'How does TeslaPrimeCapital generate returns?', a: 'Our fund managers deploy capital across diversified strategies including equities, crypto assets, and algorithmic trading for consistent daily returns.' },
  { q: 'Is my initial investment protected?', a: 'Yes, your principal is returned in full at the end of your plan duration. We maintain a capital reserve fund to ensure all investor principals are secured.' },
  { q: 'How do I withdraw my earnings?', a: 'Navigate to Withdraw in your dashboard, enter the amount and wallet address. Withdrawals are processed within minutes for verified accounts.' },
  { q: 'What is the minimum investment?', a: 'Our Basic plan starts at just $200, making professional investment management accessible to everyone.' },
];

export default function LandingPage() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-tesla-dark text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-tesla-dark/95 backdrop-blur-md border-b border-tesla-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <TeslaLogo />
              <span className="text-white font-bold text-lg tracking-tight">TeslaPrimeCapital</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {['Home', 'Plans', 'About', 'FAQ', 'Contact'].map((link) => (
                <a key={link} href={`#${link.toLowerCase()}`} className="text-gray-400 hover:text-white text-sm font-medium transition-colors">{link}</a>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => router.push('/login')} className="text-gray-300 hover:text-white text-sm font-medium px-4 py-2 transition-colors">Sign In</button>
              <button onClick={() => router.push('/register')} className="bg-[#CC0000] hover:bg-[#a30000] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">Get Started</button>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
              </svg>
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden bg-tesla-dark border-t border-tesla-border px-4 py-4 space-y-3">
            {['Home', 'Plans', 'About', 'FAQ', 'Contact'].map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-white text-sm font-medium py-2">{link}</a>
            ))}
            <div className="pt-3 border-t border-tesla-border flex flex-col gap-2">
              <button onClick={() => router.push('/login')} className="text-gray-300 hover:text-white text-sm font-medium py-2 text-left">Sign In</button>
              <button onClick={() => router.push('/register')} className="bg-[#CC0000] hover:bg-[#a30000] text-white text-sm font-semibold px-5 py-2.5 rounded-lg text-center transition-colors">Get Started</button>
            </div>
          </div>
        )}
      </nav>

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
                TeslaPrimeCapital offers professionally managed investment plans with daily returns up to 1.8%.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => router.push('/register')} className="bg-[#CC0000] hover:bg-[#a30000] text-white font-semibold px-8 py-3.5 rounded-lg text-base transition-all duration-300">
                  Start Investing Now
                </button>
                <a href="#plans" className="border border-tesla-border hover:border-gray-500 text-gray-300 hover:text-white font-semibold px-8 py-3.5 rounded-lg text-base transition-all duration-300 text-center">
                  View Plans
                </a>
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
      <section id="plans" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
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
                  <button onClick={() => router.push('/login')} className="w-full bg-[#CC0000] hover:bg-[#a30000] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
                    Invest Now
                  </button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Why Us */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-tesla-card/30">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why <span className="text-[#CC0000]">Choose Us</span></h2>
              <p className="text-gray-400 max-w-xl mx-auto">Cutting-edge technology with institutional-grade fund management.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Managed Portfolios', desc: 'Expert fund managers allocate your capital across diversified strategies for optimal risk-adjusted returns.' },
              { title: 'Daily Profit Accrual', desc: 'Transparent, real-time profit tracking and instant crediting to your account every day.' },
              { title: 'Secure & Regulated', desc: 'Bank-grade encryption, multi-factor authentication, and full regulatory compliance.' },
              { title: 'Instant Withdrawals', desc: 'Access your funds whenever you need. Processed within minutes, not days.' },
            ].map((item, i) => (
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
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked <span className="text-[#CC0000]">Questions</span></h2>
          </div>
        </FadeIn>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className="text-white font-medium text-sm sm:text-base pr-4">{faq.q}</span>
                  <svg className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed animate-fade-in">{faq.a}</div>}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#CC0000]/20 via-tesla-card to-tesla-card border border-[#CC0000]/20 rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-8">Join 45,000+ investors earning daily returns. Your financial future starts with a single decision.</p>
            <button onClick={() => router.push('/register')} className="bg-[#CC0000] hover:bg-[#a30000] text-white font-semibold px-8 py-3.5 rounded-lg text-base transition-all duration-300">
              Create Free Account
            </button>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-tesla-border bg-tesla-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TeslaLogo className="w-6 h-6" />
                <span className="text-white font-bold text-sm">TeslaPrimeCapital</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">Professional investment management with daily returns you can count on.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
              <ul className="space-y-2">
                {['About Us', 'Careers', 'Press', 'Blog'].map((l) => (
                  <li key={l}><a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Resources</h4>
              <ul className="space-y-2">
                {['Documentation', 'Help Center', 'API Status', 'Partners'].map((l) => (
                  <li key={l}><a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-2">
                {['Privacy Policy', 'Terms of Service', 'Risk Disclosure', 'AML Policy'].map((l) => (
                  <li key={l}><a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-tesla-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">&copy; 2026 TeslaPrimeCapital. All rights reserved.</p>
            <div className="flex gap-4">
              {['Twitter', 'LinkedIn', 'Telegram'].map((s) => (
                <a key={s} href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}