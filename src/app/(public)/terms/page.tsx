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
  { title: '1. Acceptance of Terms', content: ['By accessing or using the Tesla Prime Capital platform, you agree to be bound by these Terms of Service, our Privacy Policy, and all applicable laws and regulations. If you do not agree with any part of these terms, you must not use our platform. These terms apply to all users, including investors, visitors, and any other persons who access or use the service.'] },
  { title: '2. Eligibility', content: ['To use Tesla Prime Capital, you must be at least 18 years of age (or the legal age of majority in your jurisdiction). You must have the legal capacity to enter into binding agreements. By creating an account, you represent and warrant that you meet these eligibility requirements.'] },
  { title: '3. Account Registration and Security', content: ['You are responsible for maintaining the confidentiality of your account credentials, including your email address, password, and any two-factor authentication codes. You must notify us immediately if you suspect unauthorized access to your account. Tesla Prime Capital will never ask for your password via email, phone, or any other communication channel.'] },
  { title: '4. Investment Services', content: ['Tesla Prime Capital provides investment management services through professionally managed plans. All investments involve risk, and past performance does not guarantee future results. The daily return rates advertised are targets based on historical performance and market conditions, and actual returns may vary. We reserve the right to modify plan parameters with reasonable notice.'] },
  { title: '5. Deposits and Withdrawals', content: ['Deposits made via cryptocurrency are confirmed after the required number of blockchain confirmations. Gift card deposits are credited after verification, typically within 1-3 hours. Withdrawals are processed according to the timeline specified for your investment plan tier.'] },
  { title: '6. Prohibited Activities', content: ['Users are prohibited from: using the platform for any illegal purpose; attempting to gain unauthorized access to any portion of the platform; interfering with the platform\'s operation; creating multiple accounts or using fraudulent identities; providing false information during registration or KYC verification; attempting to manipulate investment returns or exploit system vulnerabilities; transferring or selling accounts.'] },
  { title: '7. Limitation of Liability', content: ['To the maximum extent permitted by law, Tesla Prime Capital and its directors, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our total liability shall not exceed the total fees you have paid to us in the twelve months preceding the claim.'] },
  { title: '8. Dispute Resolution', content: ['Any disputes arising from these terms shall first be attempted to be resolved through our internal support channels. If unresolved within 30 days, it shall be submitted to binding arbitration in accordance with applicable rules.'] },
  { title: '9. Contact', content: ['For questions about these Terms of Service, please contact us at legal@teslaprimecapital.com or through our support channels.'] },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-tesla-dark text-white page-enter">
      <section className="relative pt-36 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto overflow-hidden">
        <div className="float-orb float-orb-sm" style={{ top: '10%', left: '-5%' }} />
        <FadeIn>
          <div className="text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#CC0000]/10 border border-[#CC0000]/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-[#CC0000] text-sm font-medium">Legal Document</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 heading-gradient">Terms of Service</h1>
            <p className="text-gray-500 text-sm">Last updated: July 2026</p>
          </div>
        </FadeIn>
      </section>
      <hr className="section-divider" />
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
