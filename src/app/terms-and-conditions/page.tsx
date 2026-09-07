import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Loveridge Properties & Consult',
  description: 'Rules governing website use, property services and international procurement',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-sm space-y-8">
          {/* Header */}
          <div className="space-y-1.5 border-b border-slate-100 pb-6">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800">
              Website Policy Summary
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Terms and Conditions
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">
              Rules governing website use, property services and international procurement
            </p>
          </div>

          {/* Legal Effect Box */}
          <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/70 border border-emerald-300/80 text-xs sm:text-sm text-slate-800 leading-relaxed">
            <strong className="text-emerald-950 font-bold">Legal effect:</strong> Using the website or submitting an enquiry does not create a binding sale, lease, agency, renovation, procurement or shipping contract. A separate signed agreement, approved quotation or official invoice governs each transaction.
          </div>

          {/* Policy Sections */}
          <div className="space-y-7 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {/* 1. Services and Website Information */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-emerald-900">
                1. Services and Website Information
              </h2>
              <p>
                Loveridge Properties and Consult Limited provides property sales, rentals and brokerage; property searches and viewings; valuation, management, maintenance and renovation coordination; real-estate advisory; and international sourcing and shipping of building materials, machinery and equipment. Website information is general and may change without notice.
              </p>
            </section>

            {/* 2. Property Listings and Due Diligence */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-emerald-900">
                2. Property Listings and Due Diligence
              </h2>
              <p>
                We take reasonable steps to present listings accurately, but availability, prices, measurements, photographs and descriptions may change or require confirmation. Unless expressly stated, Loveridge acts as an agent, broker or consultant and does not own the listed property. A website listing is not proof of ownership. Clients must complete appropriate legal, title, survey and technical checks before payment. Any title assurance must appear in a specific written professional report or agreement.
              </p>
            </section>

            {/* 3. Viewings, Valuations and Project Services */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-emerald-900">
                3. Viewings, Valuations and Project Services
              </h2>
              <p>
                Physical and live-video viewings depend on availability, owner approval, identification and any disclosed viewing or transport fee. A viewing does not reserve a property. Advertised prices and informal opinions are not formal valuations or guaranteed investment returns. Formal valuations and specialised work must be separately commissioned from appropriately qualified professionals. Renovation, maintenance and management work requires an agreed scope, price, timetable, variation process and payment schedule.
              </p>
            </section>

            {/* 4. Products, Procurement and Shipping */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-emerald-900">
                4. Products, Procurement and Shipping
              </h2>
              <p>
                Before an order, the client must approve specifications, quantity, sample where applicable, packaging, branding, price, production time, inspection requirements, shipping method and destination. Product appearance may vary slightly by factory or production batch. Custom orders may become non-cancellable after purchasing or production begins, subject to applicable law. Delivery dates are estimates unless guaranteed in writing. Duties, taxes, port charges and destination costs are paid by the client unless the quotation says otherwise.
              </p>
            </section>

            {/* 5. Prices, Payments, Cancellations and Refunds */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-emerald-900">
                5. Prices, Payments, Cancellations and Refunds
              </h2>
              <p>
                Prices may be quoted in Ghana cedis, US dollars, Chinese yuan or another agreed currency. Exchange-rate movements, taxes, shipping and third-party charges may affect the final amount. Payments must be made only to an account on an official invoice and confirmed through our official contact details. Deposit, cancellation, return and refund rules will be stated in the relevant quotation or agreement. Mandatory consumer rights remain protected.
              </p>
            </section>

            {/* 6. Client Responsibilities and Third Parties */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-emerald-900">
                6. Client Responsibilities and Third Parties
              </h2>
              <p>
                Clients must provide accurate information, possess authority to give instructions, review documents, conduct due diligence, make agreed payments and obtain required permits or import documents. Loveridge may coordinate independent owners, lawyers, valuers, contractors, factories and logistics providers. Their separate services may be governed by their own terms. Our fees and commissions will be disclosed in the applicable mandate, quotation or agreement.
              </p>
            </section>

            {/* 7. Website Use, Liability and Disputes */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-emerald-900">
                7. Website Use, Liability and Disputes
              </h2>
              <p>
                Users must not submit false information, interfere with website security, copy content for unauthorised commercial use, impersonate others or use the website for fraud or money laundering. To the extent permitted by law, Loveridge is not responsible for indirect losses caused by reliance on unconfirmed website information, third-party conduct, customs delays, exchange-rate movements or events outside our reasonable control. This does not exclude liability for fraud, wilful misconduct, gross negligence or liability that cannot legally be excluded.
              </p>
            </section>

            {/* 8. Governing Law and Contact */}
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-emerald-900">
                8. Governing Law and Contact
              </h2>
              <p>
                These terms are governed by the laws of Ghana. Complaints should first be sent to <a href="mailto:info@loveridgeproperty.com" className="text-emerald-800 font-semibold hover:underline">info@loveridgeproperty.com</a> with supporting documents. Parties should attempt good-faith negotiation and may agree to mediation before court proceedings. Contact: <a href="tel:+233246432493" className="text-emerald-800 font-semibold hover:underline">+233 24 643 2493</a>; WhatsApp: <a href="https://wa.me/8615505150635" target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-semibold hover:underline">+86 155 0515 0635</a>; Website: <a href="https://love-ridge.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-semibold hover:underline">https://love-ridge.vercel.app/</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
