import { Metadata } from 'next';

export const metadata: Metadata = { title: 'AML Policy | Tesla Prime Capital', description: 'Tesla Prime Capital anti-money laundering policy and procedures.' };

export default function AMLPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">Anti-Money Laundering <span className="text-[#CC0000]">Policy</span></h1>
      <p className="text-gray-500 text-sm mb-12">Last updated: July 2026</p>

      <div className="space-y-8 text-gray-400 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-bold text-lg mb-3">1. Policy Statement</h2>
          <p className="mb-3">Tesla Prime Capital is firmly committed to the prevention of money laundering, terrorist financing, and other financial crimes. We maintain comprehensive Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) policies and procedures that comply with international standards and applicable regulations in all jurisdictions where we operate. Our AML program is designed to detect, prevent, and report suspicious activities while ensuring that legitimate investors can use our platform with minimal friction.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">2. Customer Due Diligence (CDD)</h2>
          <p className="mb-3">We perform Customer Due Diligence on all users who create an account on our platform. This includes verifying the identity of each user through our KYC (Know Your Customer) process, which requires submission of valid government-issued identification and proof of address. We verify the authenticity of submitted documents using automated verification systems and manual review when necessary. For users who trigger enhanced due diligence criteria, we may request additional information or documentation to establish the source of funds and the nature of their investment activity.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">3. Enhanced Due Diligence (EDD)</h2>
          <p className="mb-3">Enhanced Due Diligence is applied to users or transactions that present higher risk factors. These include large transactions exceeding specified thresholds, users from jurisdictions identified as having higher money laundering risks, transactions involving complex ownership structures, patterns of activity that are inconsistent with the user&apos;s stated investment profile, and any other circumstances that warrant additional scrutiny. Enhanced due diligence may involve requesting additional documentation, conducting more thorough background checks, and obtaining senior management approval for account maintenance.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">4. Transaction Monitoring</h2>
          <p className="mb-3">We employ sophisticated transaction monitoring systems that analyze all deposits, withdrawals, and investment activities on our platform in real-time. Our monitoring systems are calibrated to identify patterns and behaviors consistent with money laundering, terrorist financing, sanctions evasion, or other financial crimes. When suspicious patterns are detected, the system generates alerts that are reviewed by our trained compliance officers who determine whether further investigation or a suspicious activity report is warranted.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">5. Reporting Obligations</h2>
          <p className="mb-3">Tesla Prime Capital complies with all applicable reporting obligations, including the filing of Suspicious Activity Reports (SARs) with relevant financial intelligence units and regulatory authorities. We cooperate fully with law enforcement agencies and regulatory bodies in investigations related to money laundering, terrorist financing, or other financial crimes. It is our policy to report suspicious transactions regardless of the amount involved and to maintain the confidentiality of such reports as required by law.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">6. Sanctions Compliance</h2>
          <p className="mb-3">We maintain strict compliance with international sanctions programs, including those administered by the United Nations, the U.S. Office of Foreign Assets Control (OFAC), the European Union, and other relevant sanctions authorities. Our systems automatically screen all users, transactions, and counterparties against current sanctions lists. We do not provide services to individuals or entities that are subject to sanctions, and any accounts or transactions found to involve sanctioned parties are immediately frozen and reported to the appropriate authorities.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">7. Record Keeping</h2>
          <p>We maintain comprehensive records of all user identification documents, transaction histories, due diligence activities, and compliance reports for a minimum of five years after the termination of the business relationship or the completion of the transaction, in accordance with applicable regulatory requirements. These records are securely stored and accessible only to authorized compliance personnel and regulatory authorities upon request.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">8. Staff Training</h2>
          <p>All Tesla Prime Capital employees receive comprehensive AML/CTF training upon hiring and participate in ongoing training programs to stay current with evolving regulations, typologies, and best practices. Our compliance team receives advanced training in suspicious activity identification, investigation procedures, and regulatory reporting requirements. Training completion is tracked and mandatory for all staff members.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">9. Contact</h2>
          <p>For questions about our AML policies or to report suspicious activity, please contact our compliance department at compliance@teslaprimecapital.com.</p>
        </section>
      </div>
    </div>
  );
}
