import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy | Tesla Prime Capital', description: 'Tesla Prime Capital privacy policy — how we collect, use, and protect your data.' };

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">Privacy <span className="text-[#CC0000]">Policy</span></h1>
      <p className="text-gray-500 text-sm mb-12">Last updated: July 2026</p>

      <div className="space-y-8 text-gray-400 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-bold text-lg mb-3">1. Information We Collect</h2>
          <p className="mb-3">At Tesla Prime Capital, we collect information that you voluntarily provide when creating an account, making deposits, or interacting with our platform. This includes your full name, email address, phone number (optional), government-issued identification documents (for KYC verification), cryptocurrency wallet addresses, and transaction history.</p>
          <p>We also automatically collect certain technical information when you use our platform, including your IP address, browser type and version, operating system, device identifiers, pages visited, time spent on pages, and referring URLs. This data helps us improve our service, prevent fraud, and ensure platform security.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">2. How We Use Your Information</h2>
          <p className="mb-3">We use your collected information for several critical purposes: to create and manage your investment account, process deposits and withdrawals, verify your identity for regulatory compliance, communicate important account updates and notifications, provide customer support, detect and prevent fraud and unauthorized access, improve our platform through usage analytics, and comply with legal and regulatory obligations.</p>
          <p>We will never sell your personal information to third parties. We may share limited data with trusted service providers who assist in operating our platform (such as payment processors, cloud hosting providers, and security auditors), but these partners are contractually bound to protect your data and may only use it for the specific services we have engaged them to provide.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">3. Data Security</h2>
          <p className="mb-3">We implement industry-leading security measures to protect your personal information. All data transmissions are encrypted using 256-bit SSL/TLS encryption. Sensitive data, including identification documents and financial information, is encrypted at rest using AES-256 encryption. Our infrastructure is hosted on secure, geographically distributed servers with enterprise-grade physical security, firewall protection, and intrusion detection systems.</p>
          <p>We conduct regular third-party security audits and penetration testing to identify and address any vulnerabilities. Access to personal data is strictly limited to authorized personnel who require it for their specific job functions, and all access is logged and monitored. Despite our best efforts, no system is completely secure, and we cannot guarantee absolute security of your information.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">4. Cookies and Tracking</h2>
          <p className="mb-3">Our platform uses cookies and similar tracking technologies to enhance your browsing experience. Essential cookies are necessary for the platform to function properly, including session management, authentication, and security features. Analytics cookies help us understand how users interact with our platform so we can improve the experience. You can manage your cookie preferences through your browser settings, but disabling essential cookies may affect platform functionality.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">5. Data Retention</h2>
          <p>We retain your personal information for as long as your account is active or as needed to provide our services. After account closure, we retain certain data for a minimum of 5 years to comply with financial regulations and anti-money laundering requirements. You may request deletion of non-regulatory data by contacting our support team, though some data may need to be retained for legal compliance purposes.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">6. Your Rights</h2>
          <p className="mb-3">You have the right to access, correct, or update your personal information at any time through your account settings or by contacting our support team. You may request a copy of all personal data we hold about you. You have the right to withdraw consent for data processing where applicable. You may request deletion of your account and associated data, subject to regulatory retention requirements. You have the right to lodge a complaint with a supervisory data protection authority if you believe your data rights have been violated.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">7. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or regulatory requirements. We will notify you of any material changes by posting the updated policy on our platform and, where appropriate, by sending you an email notification. Your continued use of our platform after any changes constitutes acceptance of the revised policy. We encourage you to review this page periodically for the latest information on our privacy practices.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">8. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy or our data handling practices, please contact us at privacy@teslaprimecapital.com or through our support channels accessible on our platform.</p>
        </section>
      </div>
    </div>
  );
}
