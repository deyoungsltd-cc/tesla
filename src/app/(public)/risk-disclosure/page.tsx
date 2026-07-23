'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';

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

const sections = [
  { title: '1. Market Risk', content: ['Investment returns are subject to market fluctuations and volatility. Global financial markets can experience significant price swings due to economic conditions, geopolitical events, regulatory changes, technological developments, and other factors beyond our control. While our diversified strategy aims to mitigate market risk, no investment strategy can completely eliminate exposure to market downturns.'] },
  { title: '2. Cryptocurrency Risk', content: ['Our platform accepts and invests in cryptocurrency, which carries unique risks including extreme price volatility, regulatory uncertainty across different jurisdictions, potential for exchange failures or hacks, technology risks associated with blockchain networks, and the relatively nascent nature of the cryptocurrency market.'] },
  { title: '3. Liquidity Risk', content: ['While we strive to process withdrawals promptly, certain market conditions or operational circumstances may temporarily affect the availability of funds for withdrawal. During periods of extreme market volatility, the liquidity of underlying assets may be reduced, potentially impacting the speed at which withdrawals can be processed.'] },
  { title: '4. Technology and Operational Risk', content: ['Our platform relies on technology infrastructure including trading algorithms, third-party APIs, blockchain networks, and internet connectivity. Despite our robust security measures and redundancy systems, we are exposed to risks including system failures, cyber attacks, data breaches, software bugs, and network outages.'] },
  { title: '5. Regulatory Risk', content: ['The regulatory environment for investment platforms and cryptocurrency-related services is evolving rapidly across different jurisdictions. Changes in laws, regulations, or regulatory interpretations could affect our operations, the services we can offer, or the tax treatment of your investments.'] },
  { title: '6. No Guarantee of Returns', content: ['The daily return rates advertised for our investment plans represent targets based on historical performance and current market analysis. They do not constitute guarantees of future performance. Actual returns may be higher or lower than the advertised rates depending on market conditions.'] },
  { title: '7. Investor Responsibility', content: ['Before investing, you should carefully assess your personal financial situation, investment objectives, and risk tolerance. We recommend consulting with a qualified financial advisor before making any investment decisions. You are solely responsible for your investment decisions and should only invest funds that you can afford to lose.'] },
];

export default function RiskDisclosurePage() {
  return (
    <div className="min-h-screen bg-tesla-dark text-white page-enter">
      <section className="relative pt-36 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto overflow-hidden">
        <div className="float-orb float-orb-lg" style={{ top: '-5%', left: '-10%' }} />
        <FadeIn>
          <div className="text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#CC0000]/10 border border-[#CC0000]/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-[#CC0000] text-sm font-medium">Legal Document</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 heading-gradient">Risk Disclosure</h1>
            <p className="text-gray-500 text-sm">Last updated: July 2026</p>
          </div>
        </FadeIn>
      </section>

      <hr className="section-divider" />

      {/* Warning Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mb-12">
        <FadeIn>
          <div className="bg-red-900/20 border border-red-800/50 rounded-2xl p-8 noise-overlay">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <p className="text-red-400 font-bold text-base mb-2">Important Notice</p>
                <p className="text-gray-300 text-sm leading-relaxed">Investing in financial markets involves substantial risk of loss and is not suitable for every investor. The value of your investment may go down as well as up. You should carefully consider whether investment in our plans is appropriate for your financial situation.</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Content */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-24">
        <div className="space-y-8">
          {sections.map((section, i) => (
            <FadeIn key={i} delay={i * 60}>
              <div className="dash-card card-shine noise-overlay p-8">
                <h2 className="text-white font-bold text-xl mb-4">{section.title}</h2>
                <div className="text-gray-400 text-sm leading-relaxed space-y-3">
                  {section.content.map((p, j) => <p key={j}>{p}</p>)}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
