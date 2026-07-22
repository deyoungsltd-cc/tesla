import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Risk Disclosure | Tesla Prime Capital', description: 'Tesla Prime Capital risk disclosure — understand the risks before investing.' };

export default function RiskDisclosurePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">Risk <span className="text-[#CC0000]">Disclosure</span></h1>
      <p className="text-gray-500 text-sm mb-12">Last updated: July 2026</p>

      <div className="bg-red-900/20 border border-red-800/50 rounded-2xl p-6 mb-12">
        <p className="text-red-400 font-semibold text-sm mb-2">Important Notice</p>
        <p className="text-gray-300 text-sm leading-relaxed">Investing in financial markets involves substantial risk of loss and is not suitable for every investor. The value of your investment may go down as well as up. You should carefully consider whether investment in our plans is appropriate for your financial situation, investment objectives, and risk tolerance. Past performance is not indicative of future results.</p>
      </div>

      <div className="space-y-8 text-gray-400 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-bold text-lg mb-3">1. Market Risk</h2>
          <p className="mb-3">Investment returns are subject to market fluctuations and volatility. Global financial markets, including equity markets, cryptocurrency markets, and commodity markets, can experience significant price swings due to economic conditions, geopolitical events, regulatory changes, technological developments, and other factors beyond our control. While our diversified strategy aims to mitigate market risk, no investment strategy can completely eliminate exposure to market downturns.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">2. Cryptocurrency Risk</h2>
          <p className="mb-3">Our platform accepts and invests in cryptocurrency, which carries unique risks including extreme price volatility, regulatory uncertainty across different jurisdictions, potential for exchange failures or hacks, technology risks associated with blockchain networks, and the relatively nascent nature of the cryptocurrency market. The value of cryptocurrency holdings can fluctuate dramatically within short periods, and in some cases, cryptocurrency assets may lose significant or total value.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">3. Liquidity Risk</h2>
          <p>While we strive to process withdrawals promptly, certain market conditions or operational circumstances may temporarily affect the availability of funds for withdrawal. During periods of extreme market volatility, the liquidity of underlying assets may be reduced, potentially impacting the speed at which withdrawals can be processed. Our reserve fund is designed to mitigate this risk, but cannot guarantee instant liquidity under all market conditions.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">4. Technology and Operational Risk</h2>
          <p className="mb-3">Our platform relies on technology infrastructure including trading algorithms, third-party APIs, blockchain networks, and internet connectivity. Despite our robust security measures and redundancy systems, we are exposed to risks including system failures, cyber attacks, data breaches, software bugs, and network outages. While we maintain multiple backup systems and security protocols, these risks could temporarily affect platform availability or transaction processing.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">5. Regulatory Risk</h2>
          <p className="mb-3">The regulatory environment for investment platforms and cryptocurrency-related services is evolving rapidly across different jurisdictions. Changes in laws, regulations, or regulatory interpretations could affect our operations, the services we can offer, or the tax treatment of your investments. We actively monitor regulatory developments and maintain compliance across all jurisdictions we operate in, but cannot predict future regulatory changes.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">6. No Guarantee of Returns</h2>
          <p className="mb-3">The daily return rates advertised for our investment plans represent targets based on historical performance and current market analysis. They do not constitute guarantees of future performance. Actual returns may be higher or lower than the advertised rates depending on market conditions. While our historical track record demonstrates consistent performance, you should not invest money you cannot afford to lose, and you should have a clear understanding that investment returns are subject to market conditions.</p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">7. Investor Responsibility</h2>
          <p>Before investing, you should carefully assess your personal financial situation, investment objectives, and risk tolerance. We recommend consulting with a qualified financial advisor before making any investment decisions, especially if you are unsure about the suitability of our investment plans for your circumstances. You are solely responsible for your investment decisions and should only invest funds that you can afford to lose without affecting your essential financial obligations.</p>
        </section>
      </div>
    </div>
  );
}
