'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeroCarousel from '@/components/PageHeroCarousel';
import { ShieldCheck, Award, Globe, Users, TrendingUp, Building2, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const teamMembers: { name: string; role: string; bio: string; image?: string }[] = [
    {
      name: "Desmond Ahiahonu",
      role: "Founder & Chief Executive Officer",
      image: "/team/desmond-ahiahonu.png",
      bio: "Leads Loveridge's property and sourcing business and its partnerships in Ghana and abroad.",
    },
    {
      name: "Derrick Lovewin",
      role: "Co-Founder & Head of Administration",
      image: "/team/derrick-lovewin.png",
      bio: "Leads the administration that keeps the company organised and its teams working together.",
    },
    {
      name: "Carlson Sedem Yaw Yorke",
      role: "Head of Human Resources",
      image: "/team/carlson-yorke.png",
      bio: "Leads human resources and supports the people who deliver Loveridge's services.",
    },
    {
      name: "Frank Author",
      role: "General Manager",
      image: "/team/frank-author.jpg",
      bio: "Coordinates day-to-day operations across the business.",
    },
    {
      name: "Princilla Sefakor",
      role: "Luxury Realtor, Client Relations, Procurement & Logistics",
      image: "/team/princilla-sefakor.png",
      bio: "Works with luxury property clients and supports enquiries, procurement and logistics.",
    },
    {
      name: "Theophilus Eli",
      role: "Marketing Engineer",
      image: "/team/theophilus-eli.jpg",
      bio: "Runs the technical side of Loveridge's marketing, from the website to campaigns.",
    },
    {
      name: "Cecilia Emefa",
      role: "Sourcing Specialist, Building Materials & Construction Equipment",
      image: "/team/cecilia-emefa.png",
      bio: "Works with manufacturers in China to check specifications, confirm orders and coordinate shipping.",
    },
    {
      name: "Benjamin Oduro N.",
      role: "Procurement & Shipping",
      image: "/team/benjamin-oduro.png",
      bio: "Manages freight bookings, shipping documents and customs coordination from factory to port.",
    },
  ];

  const boardMembers = [
    { name: "Sakariyau Babatunde Abdulkadir", background: "Board Director · PhD, Mining Engineering" },
    { name: "Chiemeka Maxwell", background: "Board Director · PhD, Electrical Engineering" },
    { name: "Samuel Kofi Anamor", background: "Board Director · Doctor of Engineering" },
    { name: "Ernest Nii Laryea Amartey", background: "Board Director · PhD, Safety Engineering" },
    { name: "Dr. Elvis (Kodzo) Ahiahonu", background: "Board Director · PhD, Environmental Chemistry · Climate change lead" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between bg-grid-pattern relative">
      <Navbar />

      <main className="flex-1 space-y-16">
        {/* HERO CAROUSEL SECTION */}
        <PageHeroCarousel
          pageKey="about"
          title={
            <>
              Transforming Real Estate with <span className="text-emerald-400">Excellence & Practicality</span>
            </>
          }
          subtitle="Loveridge Properties and Consult bridges luxury real estate brokerage in Ghana with direct factory procurement of high-grade building materials, porcelain tiles, and construction tools globally."
        />

        {/* Intro: A team in Accra. A team in Yiwu. */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4 max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">A team in Accra. A team in Yiwu.</h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
              Founded in Accra in 2014, Loveridge Properties &amp; Consult brings together property brokerage in Ghana and building-materials sourcing in China. From East Legon, we help people find, sell, let and manage property. From Yiwu, we work directly with manufacturers on the materials, equipment and machinery our clients need.
            </p>
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
                A future where people across Ghana and Africa, Ghanaians abroad and international investors can find the right property, source building materials wisely and build with confidence, and where African business owners and international partners grow businesses together.
              </p>
            </div>

            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-900">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Our Mission</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                To make it easier for families, builders and investors to find the right property and build it with materials they can trust, whether they are in Ghana, elsewhere in Africa or planning from abroad.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-emerald-100/40 py-16 rounded-3xl border border-emerald-200/60">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-emerald-800 font-extrabold text-xs uppercase tracking-widest block">Core Pillars</span>
            <h2 className="text-3xl font-extrabold text-slate-900">What defines Loveridge</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <ShieldCheck className="w-8 h-8 text-emerald-800" />
              <h4 className="text-lg font-bold text-slate-900">Someone on the ground</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                If you are abroad, we arrange live viewings, site visits and progress updates so you can see what is happening.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <TrendingUp className="w-8 h-8 text-emerald-800" />
              <h4 className="text-lg font-bold text-slate-900">Clarity before you commit</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                We help you understand which documents exist, what a quotation includes and which questions still need an answer before you pay.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <Users className="w-8 h-8 text-emerald-800" />
              <h4 className="text-lg font-bold text-slate-900">Support across languages</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                We help Ghanaian owners and Chinese investors discuss the same site, specification and terms in a language each side understands.
              </p>
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-emerald-800 font-extrabold text-xs uppercase tracking-widest block">Executive Leadership</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Meet the team</h2>
            <p className="text-slate-600 text-sm leading-relaxed font-medium pt-1">
              From property viewings in Ghana to factory visits in Yiwu, our team brings together experience in real estate, client relations, engineering and logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {teamMembers.map((member, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-4">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-2xl object-cover shadow-md"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-emerald-800 text-white font-bold text-3xl flex items-center justify-center shadow-md">
                    {member.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                  <span className="text-xs font-bold text-emerald-800 block mt-0.5">{member.role}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Board of Directors */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900">Board of Directors</h2>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
            <div className="hidden sm:grid grid-cols-2 bg-emerald-950 text-white text-sm font-bold px-6 py-4">
              <span>Name</span>
              <span>Background</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {boardMembers.map((member) => (
                <li key={member.name} className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-4 px-6 py-4">
                  <span className="text-sm font-bold text-slate-900">{member.name}</span>
                  <span className="text-sm text-slate-600 font-medium">{member.background}</span>
                </li>
              ))}
            </ul>
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
