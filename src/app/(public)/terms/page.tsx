import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service | Tesla Prime Capital', description: 'Tesla Prime Capital terms of service — rules and conditions for using our platform.' };

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">Terms of <span className="text-[#CC0000]">Service</span></h1>
      <p className="text-gray-500 text-sm mb-12">Last updated: July 2026</p>

      <div className="space-y-8 text-gray-400 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-bold text-lg mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using the Tesla Prime Capital platform, you agree to be bound by these Terms of Service, our Privacy Policy, and all applicable laws and regulations. If you do not agree with any part of these terms, you must not use our platform. These terms apply to all users, including investors, visitors, and any other persons who access or use the service. We reserve the right to update these terms at any time, and your continued use of the platform after changes constitutes acceptance of the revised terms.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">2. Eligibility</h2>
          <p className="mb-3">To use Tesla Prime Capital, you must be at least 18 years of age (or the legal age of majority in your jurisdiction). You must have the legal capacity to enter into binding agreements. By creating an account, you represent and warrant that you meet these eligibility requirements. If you are using the platform on behalf of an entity, you represent that you have the authority to bind that entity to these terms.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">3. Account Registration and Security</h2>
          <p className="mb-3">You are responsible for maintaining the confidentiality of your account credentials, including your email address, password, and any two-factor authentication codes. You must notify us immediately if you suspect unauthorized access to your account. You are responsible for all activities that occur under your account. Tesla Prime Capital will never ask for your password via email, phone, or any other communication channel. We strongly recommend enabling all available security features and using a unique, strong password for your account.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">4. Investment Services</h2>
          <p className="mb-3">Tesla Prime Capital provides investment management services through professionally managed plans. All investments involve risk, and past performance does not guarantee future results. The daily return rates advertised are targets based on historical performance and market conditions, and actual returns may vary. Your principal is returned at the end of the plan duration subject to the terms of your specific plan. We reserve the right to modify plan parameters, including return rates and durations, with reasonable notice to active investors.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">5. Deposits and Withdrawals</h2>
          <p className="mb-3">Deposits made via cryptocurrency are confirmed after the required number of blockchain confirmations. Gift card deposits are credited after verification, which typically takes 1-3 hours. Once credited, deposited funds become available for investment according to the plan terms. Withdrawals are processed according to the timeline specified for your investment plan tier. We reserve the right to delay withdrawals for security review if suspicious activity is detected, and we will communicate promptly with you in such cases.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">6. Prohibited Activities</h2>
          <p className="mb-3">Users are prohibited from: using the platform for any illegal purpose or in violation of any applicable laws; attempting to gain unauthorized access to any portion of the platform or its systems; interfering with or disrupting the platform&apos;s operation or servers; creating multiple accounts or using fraudulent identities; providing false or misleading information during registration or KYC verification; attempting to manipulate investment returns or exploit system vulnerabilities; transferring or selling accounts to other individuals; or using automated systems or bots to interact with the platform without authorization.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">7. Limitation of Liability</h2>
          <p className="mb-3">To the maximum extent permitted by law, Tesla Prime Capital and its directors, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform, including but not limited to loss of profits, data, or investment capital. Our total liability to you for any claims arising from or related to these terms or the platform shall not exceed the total fees you have paid to us in the twelve months preceding the claim.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">8. Dispute Resolution</h2>
          <p>Any disputes arising from or related to these terms or the platform shall first be attempted to be resolved through our internal support channels. If a dispute cannot be resolved within 30 days, it shall be submitted to binding arbitration in accordance with the rules of the applicable arbitration authority. The arbitration shall be conducted in English, and the decision of the arbitrator(s) shall be final and binding. You agree to waive your right to a jury trial and to participate in class action lawsuits.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">9. Contact</h2>
          <p>For questions about these Terms of Service, please contact us at legal@teslaprimecapital.com or through our support channels.</p>
        </section>
      </div>
    </div>
  );
}
