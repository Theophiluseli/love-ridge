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
      title: 'Property Sales & Rental Brokerage',
      subtitle: 'Luxury Homes, Executive Apartments & Titled Land',
      description: 'We connect discerning buyers, tenants, and investors with high-value real estate assets across Accra’s prime districts (East Legon, Airport Residential, Cantonments, and Labone). Every property listed is subjected to thorough title searches.',
      features: [
        'Verified Lands Commission Title Searches',
        'Luxury Villa Sales & Executive Furnished Rentals',
        'Prime Commercial Land Plot Brokerage',
        'Transparent Deed & Title Transfer Advisory',
      ],
      linkText: 'Browse Property Listings',
      linkHref: '/properties',
    },
    {
      id: 'materials-sourcing',
      icon: Package,
      title: 'Direct International Building Materials Sourcing',
      subtitle: 'Porcelain Tiles, Marble, Power Tools & Smart Lock Imports',
      description: 'We eliminate intermediary markups by directly importing construction materials, nano-polished porcelain tiles, natural marble, and industrial tools directly from certified manufacturers in Italy, Germany, and China.',
      features: [
        'Wholesale Carrara & Porcelain Floor Tiles (60x120cm, 80x80cm)',
        'Heavy-Duty Cordless Power Tools & Construction Sets',
        'Biometric 5-in-1 Smart Door Locks & Security Hardware',
        'CIF / FOB Shipping & Customs Clearance Management',
      ],
      linkText: 'Explore Building Materials Store',
      linkHref: '/products',
    },
    {
      id: 'renovation-management',
      icon: Wrench,
      title: 'Property Renovation & Development Management',
      subtitle: 'Turnkey Construction & Interior Renovation Supervision',
      description: 'From partial residential refurbishments to full commercial interior fit-outs, our engineering and management team oversees procurement, site labor, tile laying, and quality inspection to deliver stunning finishes on schedule.',
      features: [
        'Complete Residential & Villa Renovation',
        'Tile & Marble Cladding Installation Supervision',
        'Smart Home Lock & Automation Fitting',
        'Budget Optimization & Quality Audit Reports',
      ],
      linkText: 'Book Renovation Consultation',
      action: 'renovation',
    },
    {
      id: 'titling-advisory',
      icon: ShieldCheck,
      title: 'Real Estate Titling & Strategic Investment Advisory',
      subtitle: 'Legal Due Diligence, Valuation & High-Yield Portfolio Management',
      description: 'Navigating land ownership in Ghana requires meticulous legal diligence. Our advisory service provides clear title verification, land registration assistance, property valuation, and ROI forecasting for commercial developers.',
      features: [
        'Lands Commission Title Verification & Site Plans',
        'Commercial Real Estate Yield Analysis',
        'Land Registration & Indenture Legal Guidance',
        'Foreign Investor & Diaspora Acquisition Support',
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
            Our Specialist Real Estate & <span className="gradient-text">Procurement Services</span>
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
              <h4 className="text-base font-bold text-slate-900">Initial Inquiry</h4>
              <p className="text-xs text-slate-600 font-medium">Submit your property viewing request or building material quote specifications.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <span className="w-10 h-10 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                2
              </span>
              <h4 className="text-base font-bold text-slate-900">Title Audit & Quote</h4>
              <p className="text-xs text-slate-600 font-medium">We verify property titles at Lands Commission or calculate factory CIF material quotes.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <span className="w-10 h-10 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                3
              </span>
              <h4 className="text-base font-bold text-slate-900">Site Inspection & Sample</h4>
              <p className="text-xs text-slate-600 font-medium">Conduct physical property walkthrough or inspect porcelain tile / tool samples.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <span className="w-10 h-10 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                4
              </span>
              <h4 className="text-base font-bold text-slate-900">Deed Transfer / Delivery</h4>
              <p className="text-xs text-slate-600 font-medium">Final legal title execution or container dispatch to your site location.</p>
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
