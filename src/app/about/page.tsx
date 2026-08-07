'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Award, Globe, Users, TrendingUp, Sparkles, Building2, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'Kwaku Loveridge',
      role: 'Founder & Chief Executive Officer',
      bio: 'Over 15 years of experience in luxury real estate investment, property titling, and international building materials procurement.',
    },
    {
      name: 'Ama Osei',
      role: 'Head of Real Estate & Property Advisory',
      bio: 'Specialist in East Legon, Airport Residential, and Cantonments luxury residential brokerage and land acquisition.',
    },
    {
      name: 'Kofi Mensah',
      role: 'Lead Procurement Manager (China & Italy)',
      bio: 'Manages direct manufacturer relations for high-grade porcelain floor tiles, natural marble slabs, and heavy construction machinery.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between bg-grid-pattern relative">
      <Navbar />

      <main className="flex-1 space-y-16 pt-6">
        {/* Hero Section */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-800" /> Excellence in Real Estate & Global Sourcing
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Transforming Real Estate with <span className="gradient-text">Excellence & Practicality</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto font-medium leading-relaxed">
            Loveridge Properties and Consult bridges luxury real estate brokerage in Ghana with direct factory procurement of high-grade building materials, porcelain tiles, and construction tools globally.
          </p>
        </section>

        {/* Company Stats Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
            <div className="text-center space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-900">150+</span>
              <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Titled Properties Listed</span>
            </div>
            <div className="text-center space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-900">$12M+</span>
              <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Materials Exported</span>
            </div>
            <div className="text-center space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-900">100%</span>
              <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Title Legal Guarantee</span>
            </div>
            <div className="text-center space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-900">15+</span>
              <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Years Industry Expertise</span>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-900">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Our Vision</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                To be the premier multi-purpose real estate & procurement company in West Africa, renowned for transparent property transactions, legal integrity, and seamless global material supply chains.
              </p>
            </div>

            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-900">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Our Mission</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                To simplify the global home-buying and renting process while optimizing the sourcing and export of essential materials. We are committed to ensuring families and developers worldwide enjoy comfortable, stylish properties.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-emerald-100/40 py-16 rounded-3xl border border-emerald-200/60">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-emerald-800 font-extrabold text-xs uppercase tracking-widest block">Core Pillars</span>
            <h2 className="text-3xl font-extrabold text-slate-900">What Defines Loveridge</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <ShieldCheck className="w-8 h-8 text-emerald-800" />
              <h4 className="text-lg font-bold text-slate-900">Legal Integrity & Title Assurance</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Every property and land parcel listed with Loveridge undergoes rigorous verification at the Lands Commission before marketing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <TrendingUp className="w-8 h-8 text-emerald-800" />
              <h4 className="text-lg font-bold text-slate-900">Direct Factory Procurement</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                By maintaining direct relations with certified factories in Italy and China, we eliminate reseller markups for real estate developers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <Users className="w-8 h-8 text-emerald-800" />
              <h4 className="text-lg font-bold text-slate-900">Client-Centric Advisory</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Our dedicated advisory staff provide end-to-end guidance from initial viewing request to final deed handover and material delivery.
              </p>
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-emerald-800 font-extrabold text-xs uppercase tracking-widest block">Executive Leadership</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Meet Our Management Team</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white font-bold text-xl flex items-center justify-center shadow-md">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                  <span className="text-xs font-bold text-emerald-800 block mt-0.5">{member.role}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="bg-slate-950 text-white p-10 sm:p-14 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-extrabold">Ready to Find Your Next Property or Source Materials?</h3>
              <p className="text-xs text-slate-400 font-medium">Contact our team in East Legon, Accra for personalized property viewing or wholesale quotes.</p>
            </div>
            <div className="flex gap-4 shrink-0">
              <Link href="/contact" className="gradient-btn px-6 py-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
                Contact Us <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
