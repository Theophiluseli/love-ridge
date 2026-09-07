import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Loveridge Properties & Consult',
  description: 'How Loveridge collects, uses and protects personal information',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-sm space-y-8">
          {/* Header */}
          <div className="space-y-2 border-b border-slate-100 pb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">
              How Loveridge collects, uses and protects personal information
            </p>
          </div>

          {/* Company Identity Box */}
          <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/70 border border-emerald-300/80 text-xs sm:text-sm text-slate-800 leading-relaxed">
            <strong className="text-emerald-950 font-bold">Company identity:</strong> Loveridge Properties and Consult Limited is a Ghanaian limited-liability company incorporated on 25 March 2014 under the Companies Act, 1963 (Act 179), and authorised to commence business on 26 March 2014. Company Registration No.: CS390502014. Certificate Reference: C0003382524.
          </div>

          {/* Policy Sections */}
          <div className="space-y-7 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {/* 1. Scope */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-emerald-900">
                1. Scope
              </h2>
              <p>
                Loveridge Properties and Consult Limited, trading as Loveridge Properties &amp; Consult (&quot;Loveridge,&quot; &quot;we&quot; or &quot;our&quot;), respects your privacy. This policy applies when you visit our website, submit an enquiry, schedule a physical or virtual property viewing, request a valuation, renovation or management service, source products, or contact us through email, telephone, WhatsApp or social media.
              </p>
            </section>

            {/* 2. Information We Collect */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-emerald-900">
                2. Information We Collect
              </h2>
              <p>Depending on the service requested, we may collect:</p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 text-slate-700">
                <li>
                  Contact details, including your name, telephone number, WhatsApp number, email address, location and preferred communication method.
                </li>
                <li>
                  Property or service details, including requirements, budgets, viewing schedules, ownership information, photographs, documents and instructions.
                </li>
                <li>
                  Transaction and compliance information, including identification, signed agreements, payment confirmation and title, shipping or customs documents where reasonably required.
                </li>
                <li>
                  Technical information, such as IP address, browser type, device type, pages visited and essential cookie data.
                </li>
              </ul>
            </section>

            {/* 3. How We Use Information */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-emerald-900">
                3. How We Use Information
              </h2>
              <p>
                We use personal information to respond to enquiries, recommend properties or services, arrange viewings, prepare quotations and agreements, coordinate title searches, valuations, renovations, suppliers, inspections, shipping and customs clearance, process transactions, prevent fraud, maintain records and meet legal obligations. Processing is based on consent, contractual necessity, legal duties or legitimate business interests permitted by law.
              </p>
            </section>

            {/* 4. Sharing and International Transfers */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-emerald-900">
                4. Sharing and International Transfers
              </h2>
              <p>
                We may share only necessary information with property owners, buyers, tenants, lawyers, licensed brokers, surveyors, valuers, the Lands Commission, contractors, manufacturers, freight forwarders, customs agents, banks, technology providers and public authorities. International sourcing may require transfers between Ghana, China and other destinations. We do not sell personal information and will take reasonable steps to protect information shared abroad.
              </p>
            </section>

            {/* 5. Marketing, Cookies and Payments */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-emerald-900">
                5. Marketing, Cookies and Payments
              </h2>
              <p>
                Marketing messages will be sent only where legally permitted and the required consent has been obtained. You may unsubscribe at any time. The website may use essential cookies; any analytics or advertising cookies should be disclosed through a cookie notice and consent control. Payments are handled through approved providers. We never request banking passwords, PINs or card-security codes.
              </p>
            </section>

            {/* 6. Retention, Security and Your Rights */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-emerald-900">
                6. Retention, Security and Your Rights
              </h2>
              <p>
                We retain information only for as long as necessary for the enquiry, service, transaction, fraud prevention or statutory recordkeeping. Reasonable administrative and technical safeguards are used, but no online system is completely secure. Subject to Ghanaian law, you may request access, correction or deletion; object to certain processing; stop direct marketing; or withdraw consent. Identity verification may be required before a request is completed.
              </p>
            </section>

            {/* 7. Contact and Complaints */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-emerald-900">
                7. Contact and Complaints
              </h2>
              <p>
                Privacy requests may be sent to <a href="mailto:info@loveridgeproperty.com" className="text-emerald-800 font-semibold hover:underline">info@loveridgeproperty.com</a>. Head Office: boundary Road, East Legon, Accra, Ghana. Telephone: <a href="tel:+233246432493" className="text-emerald-800 font-semibold hover:underline">+233 24 643 2493</a>. International Office: Yiwu International Trade Center, Zhejiang, China. WhatsApp: <a href="https://wa.me/8615505150635" target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-semibold hover:underline">+86 155 0515 0635</a>. You may also complain to Ghana&apos;s Data Protection Commission.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
