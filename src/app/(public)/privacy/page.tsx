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
  {
    title: '1. Information We Collect',
    content: [
      'At Tesla Prime Capital, we collect information that you voluntarily provide when creating an account, making deposits, or interacting with our platform. This includes your full name, email address, phone number (optional), government-issued identification documents (for KYC verification), cryptocurrency wallet addresses, and transaction history.',
      'We also automatically collect certain technical information when you use our platform, including your IP address, browser type and version, operating system, device identifiers, pages visited, time spent on pages, and referring URLs. This data helps us improve our service, prevent fraud, and ensure platform security.',
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: [
      'We use your collected information for several critical purposes: to create and manage your investment account, process deposits and withdrawals, verify your identity for regulatory compliance, communicate important account updates and notifications, provide customer support, detect and prevent fraud and unauthorized access, improve our platform through usage analytics, and comply with legal and regulatory obligations.',
      'We will never sell your personal information to third parties. We may share limited data with trusted service providers who assist in operating our platform (such as payment processors, cloud hosting providers, and security auditors), but these partners are contractually bound to protect your data and may only use it for the specific services we have engaged them to provide.',
    ],
  },
  {
    title: '3. Data Security',
    content: [
      'We implement industry-leading security measures to protect your personal information. All data transmissions are encrypted using 256-bit SSL/TLS encryption. Sensitive data, including identification documents and financial information, is encrypted at rest using AES-256 encryption. Our infrastructure is hosted on secure, geographically distributed servers with enterprise-grade physical security, firewall protection, and intrusion detection systems.',
      'We conduct regular third-party security audits and penetration testing to identify and address any vulnerabilities. Access to personal data is strictly limited to authorized personnel who require it for their specific job functions, and all access is logged and monitored.',
    ],
  },
  {
    title: '4. Cookies and Tracking',
    content: [
      'Our platform uses cookies and similar tracking technologies to enhance your browsing experience. Essential cookies are necessary for the platform to function properly, including session management, authentication, and security features. Analytics cookies help us understand how users interact with our platform so we can improve the experience. You can manage your cookie preferences through your browser settings.',
    ],
  },
  {
    title: '5. Data Retention',
    content: [
      'We retain your personal information for as long as your account is active or as needed to provide our services. After account closure, we retain certain data for a minimum of 5 years to comply with financial regulations and anti-money laundering requirements. You may request deletion of non-regulatory data by contacting our support team.',
    ],
  },
  {
    title: '6. Your Rights',
    content: [
      'You have the right to access, correct, or update your personal information at any time through your account settings or by contacting our support team. You may request a copy of all personal data we hold about you. You have the right to withdraw consent for data processing where applicable. You may request deletion of your account and associated data, subject to regulatory retention requirements.',
    ],
  },
  {
    title: '7. Changes to This Policy',
    content: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or regulatory requirements. We will notify you of any material changes by posting the updated policy on our platform and, where appropriate, by sending you an email notification.',
    ],
  },
  {
    title: '8. Contact Us',
    content: [
      'If you have any questions about this Privacy Policy or our data handling practices, please contact us at privacy@teslaprimecapital.com or through our support channels accessible on our platform.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-tesla-dark text-white page-enter">
      {/* Hero */}
      <section className="relative pt-36 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto overflow-hidden">
        <div className="float-orb float-orb-md" style={{ top: '5%', right: '-8%' }} />
        <FadeIn>
          <div className="text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#CC0000]/10 border border-[#CC0000]/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-[#CC0000] text-sm font-medium">Legal Document</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 heading-gradient">Privacy Policy</h1>
            <p className="text-gray-500 text-sm">Last updated: July 2026</p>
          </div>
        </FadeIn>
      </section>

      <hr className="section-divider" />

      {/* Content */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-24">
        <div className="space-y-8">
          {sections.map((section, i) => (
            <FadeIn key={i} delay={i * 60}>
              <div className="dash-card card-shine noise-overlay p-8">
                <h2 className="text-white font-bold text-xl mb-4">{section.title}</h2>
                <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
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
