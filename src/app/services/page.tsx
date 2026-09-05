'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InquiryModal from '@/components/InquiryModal';
import { Building2, Package, ShieldCheck, Wrench, Award, ChevronRight, CheckCircle2, PhoneCall, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ServicesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [serviceTitle, setServiceTitle] = useState('');

  const services = [
    {
      id: 'property-brokerage',
      icon: Building2,
      title: 'Property Sales, Rentals & Brokerage',
      subtitle: 'Homes, Apartments, Commercial Property & Land',
      description: 'We help buyers, tenants, landlords and investors find suitable residential and commercial properties across Accra and other key locations in Ghana and Africa. We coordinate documentation checks and guide clients through viewings, negotiations and the transaction process.',
      features: [
        'Residential & Commercial Property Listings',
        'Rental, Lease & Property Viewing Support',
        'Land Documentation & Title Search Coordination',
        'Negotiation, Sale & Transfer Assistance',
      ],
      linkText: 'Browse Property Listings',
      linkHref: '/properties',
    },
    {
      id: 'materials-sourcing',
      icon: Package,
      title: 'International Building Materials & Equipment Sourcing',
      subtitle: 'Building Materials, Tools, Equipment & Smart Solutions',
      description: 'We help homeowners, contractors, developers and businesses source building materials, tools and equipment from reliable manufacturers in China and other major markets. We support procurement, supplier checks, quality control and shipping for projects in Ghana and across Africa.',
      features: [
        'Building Materials, Fixtures & Finishing Products',
        'Construction Tools, Machinery & Safety Equipment',
        'Supplier Verification, Negotiation & Quality Control',
        'Shipping, Consolidation & Customs Support',
      ],
      linkText: 'Explore Building Materials Store',
      linkHref: '/products',
    },
    {
      id: 'renovation-management',
      icon: Wrench,
      title: 'Property Renovation & Project Management',
      subtitle: 'Property Renovation, Interior Finishing & Project Support',
      description: 'We help property owners, developers and businesses plan and manage residential and commercial renovation projects in Ghana and across Africa. Our support covers budgeting, material sourcing, contractor coordination, site supervision and quality checks from planning through completion.',
      features: [
        'Residential & Commercial Property Renovation',
        'Interior Finishing, Tiling & Fixture Installation',
        'Budget Planning, Procurement & Contractor Coordination',
        'Site Supervision, Quality Checks & Progress Reporting',
      ],
      linkText: 'Book Renovation Consultation',
      action: 'renovation',
    },
    {
      id: 'titling-advisory',
      icon: ShieldCheck,
      title: 'Property Valuation, Due Diligence & Investment Advisory',
      subtitle: 'Property Valuation, Due Diligence & Investment Support',
      description: 'We help buyers, property owners, diaspora clients and investors determine property value and make informed real estate decisions in Ghana and selected African markets. We provide valuation support and coordinate document checks and title searches with the relevant professionals and public institutions.',
      features: [
        'Residential, Commercial Property & Land Valuation',
        'Property Ownership & Document Verification Support',
        'Lands Commission Search & Site Plan Coordination',
        'Land Registration & Indenture Legal Guidance',
        'Investment Feasibility & Diaspora Buyer Support',
      ],
      linkText: 'Request Advisory Session',
      action: 'advisory',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between bg-grid-pattern relative">
      <Navbar />

      <main className="flex-1 space-y-16 pt-6">
        {/* Hero Banner */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Award className="w-3.5 h-3.5 text-emerald-800" /> Full-Spectrum Real Estate & Procurement Solutions
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Our Property & <span className="gradient-text">Global Sourcing Services</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto font-medium leading-relaxed">
            Tailored solutions designed for homeowners, property developers, and international investors seeking verified real estate or direct factory-priced construction materials.
          </p>
        </section>

        {/* Services Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.id}
                  className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl flex flex-col justify-between space-y-6 hover:border-emerald-700/50 transition-all group"
                >
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-900 shadow-sm group-hover:scale-105 transition-transform">
                      <Icon className="w-7 h-7" />
                    </div>

                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                        {srv.subtitle}
                      </span>
                      <h3 className="text-2xl font-bold text-slate-900 mt-1">{srv.title}</h3>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {srv.description}
                    </p>

                    <ul className="space-y-2.5 pt-2 border-t border-slate-100">
                      {srv.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-xs text-slate-800 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4">
                    {srv.linkHref ? (
                      <Link
                        href={srv.linkHref}
                        className="gradient-btn w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2"
                      >
                        {srv.linkText} <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          setServiceTitle(srv.title);
                          setModalOpen(true);
                        }}
                        className="gradient-btn w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2"
                      >
                        {srv.linkText} <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Process Flow */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-emerald-800 font-extrabold text-xs uppercase tracking-widest block">Standard Operating Procedure</span>
            <h2 className="text-3xl font-extrabold text-slate-900">How Our Process Works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <span className="w-10 h-10 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                1
              </span>
              <h4 className="text-base font-bold text-slate-900">Submit Your Request</h4>
              <p className="text-xs text-slate-600 font-medium">Tell us whether you need real estate, property valuation, renovation or building-material sourcing support.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <span className="w-10 h-10 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                2
              </span>
              <h4 className="text-base font-bold text-slate-900">Viewing or Product Quotation</h4>
              <p className="text-xs text-slate-600 font-medium">We identify suitable properties and schedule viewings, or confirm your product specifications, quantities and pricing.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <span className="w-10 h-10 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                3
              </span>
              <h4 className="text-base font-bold text-slate-900">Verification & Confirmation</h4>
              <p className="text-xs text-slate-600 font-medium">We coordinate property document checks, valuation and negotiation, or verify suppliers, samples and product quality.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <span className="w-10 h-10 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                4
              </span>
              <h4 className="text-base font-bold text-slate-900">Transaction, Delivery & Handover</h4>
              <p className="text-xs text-slate-600 font-medium">We complete the property transaction or renovation handover, or coordinate the shipping and delivery of approved products.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <InquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={serviceTitle || 'Request Consultation'}
        type="GENERAL_CONTACT"
      />
    </div>
  );
}
