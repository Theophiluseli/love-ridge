'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InquiryModal from '@/components/InquiryModal';
import PageHeroCarousel from '@/components/PageHeroCarousel';
import { Building2, Package, ShieldCheck, Wrench, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ServicesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [serviceTitle, setServiceTitle] = useState('');

  const services = [
    {
      id: 'property-brokerage',
      icon: Building2,
      image: '/loveridge-consultation-bg.jpg',
      title: 'Property sales, rentals & international brokerage',
      subtitle: 'Homes, Apartments, Commercial Property & Land',
      description: "We help buyers and tenants find homes, land and commercial property in Accra, across Ghana and in other African markets. If you're selling or letting a property, we help you market it, arrange viewings and negotiate terms. If you're looking overseas, we connect you with international property developers and brokerage partners in your preferred market. For Chinese and other international investors, we help identify factory sites, meet owners of businesses for sale and explore joint ventures partnership.",
      features: [
        'International property brokerage',
        'Industrial property and joint ventures',
        'Chinese investor support in Ghana',
      ],
      linkText: 'Browse Property Listings',
      linkHref: '/properties',
    },
    {
      id: 'materials-sourcing',
      icon: Package,
      image: '/gallery/canton-fair-materials.jpg',
      title: 'International building materials & equipment sourcing',
      subtitle: 'International Building Materials & Equipment Sourcing',
      description: 'Our Yiwu team helps you source building materials, smart tools and construction machinery from China for projects in Ghana and across Africa. We confirm specifications with manufacturers and arrange samples or inspections where needed. Before you order, you can review the product details, estimated production time and costs covered by your quote. Once your goods are ready, we coordinate shipping to your destination.',
      features: [
        'Building materials, construction tools and machinery',
        'Supplier checks and quality control',
        'Shipping and customs support',
      ],
      linkText: 'Explore Building Materials Store',
      linkHref: '/products',
    },
    {
      id: 'renovation-management',
      icon: Wrench,
      image: '/gallery/hardware-samples-inspection.jpg',
      title: 'Property renovation & management',
      subtitle: 'Property Renovation, Interior Finishing & Project Support',
      description: 'Finishing a home, refurbishing an office or ready to restart an unfinished building project? We help property owners, developers and businesses manage renovations and maintenance in Ghana and across Africa. Before work begins, we agree on the scope, budget and timetable with you. If you are managing the property from abroad, we supervise the work on site and send progress updates so you can make decisions wherever you are.',
      features: [
        'Residential and commercial renovation',
        'Budgeting and contractor coordination',
        'Site supervision and progress reporting',
      ],
      linkText: 'Book Renovation Consultation',
      action: 'renovation',
    },
    {
      id: 'titling-advisory',
      icon: ShieldCheck,
      image: '/gallery/client-document-advisory.jpg',
      title: 'Property valuation, due diligence & investment advisory',
      subtitle: 'Property Valuation, Due Diligence & Investment Support',
      description: "What is the property worth, who has the right to sell it, and is the site suitable for your plans? We help buyers, owners and investors in Ghana and selected African markets answer these questions before they commit. We arrange formal valuations with qualified valuers and coordinate ownership checks and title searches with local professionals. If you're buying from abroad, we help you understand the findings and what still needs checking before you pay.",
      features: [
        'Property valuation',
        'Title search coordination and registration support',
        'Investment feasibility for diaspora and international buyers',
      ],
      linkText: 'Request Advisory Session',
      action: 'advisory',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between bg-grid-pattern relative">
      <Navbar />

      <main className="flex-1 space-y-16">
        {/* HERO CAROUSEL SECTION */}
        <PageHeroCarousel
          pageKey="services"
          title={
            <>
              Our Property & <span className="text-emerald-400">Global Sourcing Services</span>
            </>
          }
          subtitle="Tailored solutions designed for homeowners, property developers, and international investors seeking verified real estate or direct factory-priced construction materials."
        />

        {/* Services Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col justify-between hover:border-emerald-700/50 hover:shadow-2xl transition-all duration-300 group"
                >
                  {/* Top Image inside the same container */}
                  {srv.image && (
                    <div className="relative w-full h-64 sm:h-72 overflow-hidden bg-slate-100">
                      <img
                        src={srv.image}
                        alt={srv.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    </div>
                  )}

                  {/* Content below the image */}
                  <div className="p-8 sm:p-10 flex flex-col justify-between flex-1 space-y-6">
                    <div className="space-y-4">
                      {Icon && (
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-800 shadow-sm group-hover:scale-105 transition-transform">
                          <Icon className="w-7 h-7" />
                        </div>
                      )}

                      <div>
                        {srv.subtitle && (
                          <span className="text-[11px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                            {srv.subtitle}
                          </span>
                        )}
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{srv.title}</h3>
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed font-normal">
                        {srv.description}
                      </p>

                      <ul className="space-y-2.5 pt-3 border-t border-slate-100">
                        {srv.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-800 font-semibold">
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
                          className="w-full py-3.5 px-6 rounded-full bg-[#0a3b2b] hover:bg-[#072c20] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                        >
                          {srv.linkText} <ArrowRight className="w-4 h-4" />
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            setServiceTitle(srv.title);
                            setModalOpen(true);
                          }}
                          className="w-full py-3.5 px-6 rounded-full bg-[#0a3b2b] hover:bg-[#072c20] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                        >
                          {srv.linkText} <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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
