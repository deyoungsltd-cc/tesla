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
  { title: '1. Policy Statement', content: ['Tesla Prime Capital is firmly committed to the prevention of money laundering, terrorist financing, and other financial crimes. We maintain comprehensive Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) policies and procedures that comply with international standards and applicable regulations in all jurisdictions where we operate.'] },
  { title: '2. Customer Due Diligence (CDD)', content: ['We perform Customer Due Diligence on all users who create an account on our platform. This includes verifying the identity of each user through our KYC process, which requires submission of valid government-issued identification and proof of address. We verify the authenticity of submitted documents using automated verification systems and manual review when necessary.'] },
  { title: '3. Enhanced Due Diligence (EDD)', content: ['Enhanced Due Diligence is applied to users or transactions that present higher risk factors, including large transactions exceeding specified thresholds, users from jurisdictions identified as having higher money laundering risks, transactions involving complex ownership structures, and patterns of activity inconsistent with stated investment profiles.'] },
  { title: '4. Transaction Monitoring', content: ['We employ sophisticated transaction monitoring systems that analyze all deposits, withdrawals, and investment activities on our platform in real-time. Our monitoring systems are calibrated to identify patterns and behaviors consistent with money laundering, terrorist financing, sanctions evasion, or other financial crimes.'] },
  { title: '5. Reporting Obligations', content: ['Tesla Prime Capital complies with all applicable reporting obligations, including the filing of Suspicious Activity Reports (SARs) with relevant financial intelligence units and regulatory authorities. We cooperate fully with law enforcement agencies and regulatory bodies in all investigations.'] },
  { title: '6. Sanctions Compliance', content: ['We maintain strict compliance with international sanctions programs, including those administered by the United Nations, the U.S. Office of Foreign Assets Control (OFAC), the European Union, and other relevant sanctions authorities. We do not provide services to individuals or entities that are subject to sanctions.'] },
  { title: '7. Record Keeping', content: ['We maintain comprehensive records of all user identification documents, transaction histories, due diligence activities, and compliance reports for a minimum of five years in accordance with applicable regulatory requirements.'] },
  { title: '8. Staff Training', content: ['All Tesla Prime Capital employees receive comprehensive AML/CTF training upon hiring and participate in ongoing training programs. Our compliance team receives advanced training in suspicious activity identification, investigation procedures, and regulatory reporting requirements.'] },
  { title: '9. Contact', content: ['For questions about our AML policies or to report suspicious activity, please contact our compliance department at compliance@teslaprimecapital.com.'] },
];

export default function AMLPolicyPage() {
  return (
    <div className="min-h-screen bg-tesla-dark text-white page-enter">
      <section className="relative pt-36 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto overflow-hidden">
        <div className="float-orb float-orb-md" style={{ top: '5%', right: '-8%' }} />
        <FadeIn>
          <div className="text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#CC0000]/10 border border-[#CC0000]/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-[#CC0000] text-sm font-medium">Legal Document</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 heading-gradient">Anti-Money Laundering Policy</h1>
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
