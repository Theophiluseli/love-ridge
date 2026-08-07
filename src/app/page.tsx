'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import ProductCard from '@/components/ProductCard';
import InquiryModal from '@/components/InquiryModal';
import ScrollToTop from '@/components/ScrollToTop';
import {
  Building2, Package, Search, ChevronRight, Home, Clock, Building,
  Star, ChevronLeft, HelpCircle, MapPin, Send, CheckCircle2, Phone, Mail, MessageSquare, Quote, ShieldCheck, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search tab state
  const [activeTab, setActiveTab] = useState<'properties' | 'products'>('properties');
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('ALL');

  // Testimonials carousel state
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // FAQ open index state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Home Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    inquiryType: 'GENERAL_CONTACT',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'PROPERTY_VIEWING' | 'PRODUCT_QUOTE';
    title: string;
    propertyId?: string;
    productId?: string;
    itemName?: string;
  }>({
    isOpen: false,
    type: 'PROPERTY_VIEWING',
    title: '',
  });

  const testimonials = [
    {
      id: 1,
      name: 'Dr. Kwame Adjei',
      role: 'Luxury Villa Purchaser',
      location: 'East Legon, Accra',
      avatar: 'KA',
      comment: 'Loveridge Properties handled our 4-bedroom villa purchase with absolute legal clarity. Their Lands Commission search was completed before we even made our deposit offer. Truly transparent and trustworthy service!',
      rating: 5,
      type: 'Real Estate Buyer',
    },
    {
      id: 2,
      name: 'Arch. Sandra Mensah',
      role: 'Principal Commercial Architect',
      location: 'Airport Residential Area',
      avatar: 'SM',
      comment: 'We imported 3,500 sqm of Carrara Italian porcelain tiles through Loveridge. Direct factory sourcing saved our commercial project over 25% in material budget while delivering top-tier quality.',
      rating: 5,
      type: 'Store Client',
    },
    {
      id: 3,
      name: 'David & Sarah Osei',
      role: 'Diaspora Property Investors',
      location: 'London, UK & Cantonments',
      avatar: 'DO',
      comment: 'Acquiring property from abroad used to be stressful until we worked with Loveridge. Live video walkthroughs, clear indentures, and swift execution made the entire transaction effortless.',
      rating: 5,
      type: 'Diaspora Client',
    },
  ];

  const faqs = [
    {
      question: 'How do you verify property land titles before listing?',
      answer: 'Every residential property, villa, and land plot listed on Loveridge undergoes rigorous title searches at the Lands Commission and site plan verification. We ensure 100% legal title clearance before any property is presented to clients.',
    },
    {
      question: 'Can I order building materials in wholesale bulk directly from China & Italy?',
      answer: 'Yes! We facilitate direct factory procurement for porcelain floor tiles, marble slabs, power tools, and smart lock hardware. We manage FOB/CIF shipping, customs clearance, and delivery directly to your site.',
    },
    {
      question: 'How can I schedule a physical property viewing in Accra?',
      answer: 'You can click "Book Viewing" on any property card or contact our East Legon office. Our sales staff will coordinate a guided walkthrough Monday through Saturday at your convenience.',
    },
    {
      question: 'Do you assist diaspora clients buying property from abroad?',
      answer: 'Absolutely. Over 40% of our clients are based in the UK, USA, and Europe. We provide live video walkthroughs, digital legal documents, and secure escrow advisory for international transactions.',
    },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const [propRes, prodRes] = await Promise.all([
          fetch('/api/properties?featured=true'),
          fetch('/api/products?featured=true'),
        ]);
        const propData = await propRes.json();
        const prodData = await prodRes.json();
        let loadedProperties = propData.properties || [];
        if (loadedProperties.length < 3) {
          const allPropRes = await fetch('/api/properties');
          const allPropData = await allPropRes.json();
          loadedProperties = allPropData.properties || [];
        }
        setProperties(loadedProperties.slice(0, 3));
        setProducts((prodData.products || []).slice(0, 3));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: contactForm.inquiryType,
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          message: contactForm.message,
          source: 'home_page',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit inquiry.');

      setFormSubmitted(true);
      setContactForm({ name: '', email: '', phone: '', message: '', inquiryType: 'GENERAL_CONTACT' });
    } catch (err: any) {
      setFormError(err.message || 'An error occurred.');
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between bg-grid-pattern relative">
      <Navbar />

      <main className="flex-1 space-y-16 pt-6">
        {/* HERO SECTION */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto text-center space-y-8 relative z-10">
            <div className="space-y-4 max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                Welcome To <span className="gradient-text">Loveridge</span>
              </h1>
              <p className="text-emerald-900 font-extrabold text-sm sm:text-xl tracking-wide max-w-3xl mx-auto leading-snug">
                Your Ultimate Destination for Premium Properties & Smart Building Solutions
              </p>
            </div>

            {/* Dual Search Box */}
            <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-xl p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl shadow-emerald-950/10">
              <div className="flex flex-col sm:flex-row bg-slate-100 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 border border-slate-200 gap-1 sm:gap-0">
                <button
                  onClick={() => setActiveTab('properties')}
                  className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    activeTab === 'properties'
                      ? 'bg-emerald-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Search Real Estate Properties
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    activeTab === 'products'
                      ? 'bg-emerald-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Search Store Products
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      activeTab === 'properties'
                        ? 'Search location (e.g. East Legon, Cantonments, Airport)...'
                        : 'Search items (e.g. Porcelain tiles, drills, locks)...'
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:border-emerald-700"
                  />
                </div>

                {activeTab === 'properties' && (
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-700"
                  >
                    <option value="ALL">All Types</option>
                    <option value="HOUSE">House / Villa</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="LAND">Land Parcel</option>
                  </select>
                )}

                <Link
                  href={
                    activeTab === 'properties'
                      ? `/properties?search=${encodeURIComponent(searchQuery)}&propertyType=${propertyType}`
                      : `/products?search=${encodeURIComponent(searchQuery)}`
                  }
                  className="gradient-btn px-6 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
                >
                  Search Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3 FEATURE BADGES */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xl flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-full border-2 border-emerald-800 flex items-center justify-center text-emerald-800 shrink-0 group-hover:bg-emerald-800 group-hover:text-white transition-all shadow-sm">
                <Home className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-emerald-950 tracking-tight">Luxury Homes</h3>
                <p className="text-xs text-slate-500 font-medium">Verified residential villas & apartments</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xl flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-full border-2 border-emerald-800 flex items-center justify-center text-emerald-800 shrink-0 group-hover:bg-emerald-800 group-hover:text-white transition-all shadow-sm">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-emerald-950 tracking-tight">100% Trusted</h3>
                <p className="text-xs text-slate-500 font-medium">Clear land titles & legal assurance</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xl flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-full border-2 border-emerald-800 flex items-center justify-center text-emerald-800 shrink-0 group-hover:bg-emerald-800 group-hover:text-white transition-all shadow-sm">
                <Building className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-emerald-950 tracking-tight">Quality Materials</h3>
                <p className="text-xs text-slate-500 font-medium">Direct factory imported construction items</p>
              </div>
            </div>
          </div>
        </section>

        {/* WELCOME TO LOVERIDGE SECTION */}
        <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center bg-white p-6 sm:p-12 rounded-3xl border border-slate-200/90 shadow-xl">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 group">
              <img
                src="/welcome_building.png"
                alt="Welcome To Loveridge Properties"
                className="w-full h-[280px] sm:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                  Global Real Estate & Direct Procurement
                </span>
                <h4 className="text-xl font-bold">Loveridge Properties & Consult</h4>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-emerald-800 font-extrabold text-xs uppercase tracking-widest block">
                  About Our Firm
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Welcome To Loveridge
                </h2>
              </div>

              <div className="space-y-4 text-slate-600 text-sm leading-relaxed font-medium">
                <p>
                  At Loveridge Properties and Consult, we cultivate a flexible and inclusive work culture, leveraging remote and hybrid models to support our global team while addressing the evolving demands of the real estate industry.
                </p>
                <p>
                  Our expertise includes luxury homes, property renovation and management, property sales and rentals, brokerage, advisory services, and strategic investments. As a leader in sourcing and exporting building materials, tools, and equipment from China, we provide streamlined solutions for construction and renovation projects tailored to all economic levels.
                </p>
                <p>
                  Our mission is to simplify the global home-buying and renting process while optimizing the sourcing and export of essential materials. We are committed to ensuring families worldwide enjoy comfortable, stylish homes by transforming real estate experiences with excellence and practicality.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/properties"
                  className="gradient-btn px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2"
                >
                  Explore Luxury Properties <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/products"
                  className="bg-white border-2 border-emerald-800 text-emerald-900 hover:bg-emerald-50 px-6 py-3.5 rounded-2xl text-sm font-bold transition flex items-center gap-2 shadow-sm"
                >
                  Visit Our Store
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED PROPERTIES SECTION */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-emerald-800 font-bold text-xs uppercase tracking-widest block">
                Exclusive Real Estate
              </span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
                Featured Properties for Sale & Rent
              </h2>
            </div>
            <Link
              href="/properties"
              className="text-emerald-800 hover:text-emerald-900 font-bold text-sm flex items-center gap-1 group"
            >
              Browse All Properties <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          </div>

          {/* 3 Featured Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onRequestViewing={(id, title) =>
                  setModalState({
                    isOpen: true,
                    type: 'PROPERTY_VIEWING',
                    title: 'Schedule Property Viewing',
                    propertyId: id,
                    itemName: title,
                  })
                }
              />
            ))}
          </div>

          {/* View More Properties Button */}
          <div className="text-center pt-6">
            <Link
              href="/properties"
              className="gradient-btn px-8 py-3.5 rounded-2xl text-sm font-bold inline-flex items-center gap-2 shadow-xl"
            >
              View More Properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* FEATURED PRODUCTS SECTION */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-emerald-100/40 border-y border-emerald-200/60">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-emerald-800 font-bold text-xs uppercase tracking-widest block">
                  Direct Imports & Hardware
                </span>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
                  Featured Products
                </h2>
              </div>
              <Link
                href="/products"
                className="text-emerald-800 hover:text-emerald-900 font-bold text-sm flex items-center gap-1 group"
              >
                Explore Full Store <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
            </div>

            {/* Featured Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-8">
              {products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onRequestQuote={(id, name) =>
                    setModalState({
                      isOpen: true,
                      type: 'PRODUCT_QUOTE',
                      title: 'Request Wholesale Quote',
                      productId: id,
                      itemName: name,
                    })
                  }
                />
              ))}
            </div>

            {/* View More Products Button */}
            <div className="text-center pt-6">
              <Link
                href="/products"
                className="gradient-btn px-8 py-3.5 rounded-2xl text-sm font-bold inline-flex items-center gap-2 shadow-xl"
              >
                View More Store Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-2xl relative overflow-hidden">
            <Quote className="w-72 h-72 text-emerald-900/5 absolute -right-10 -bottom-10 pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">
                  Client Experiences
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Trusted by Homeowners & Commercial Developers
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Hear how our legal title guarantee and direct international factory sourcing transform property acquisitions and construction projects in Ghana.
                </p>

                <div className="pt-2 flex items-center gap-4 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400" />
                    ))}
                  </div>
                  <div>
                    <span className="text-sm font-black text-slate-900 block">4.9 / 5.0 Rating</span>
                    <span className="text-[11px] text-slate-500 font-semibold">100+ Verified Transactions</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" /> Verified Reviews
                  </span>
                </div>
              </div>

              <div className="lg:col-span-7 bg-slate-50/90 rounded-3xl p-8 border border-slate-200/80 shadow-lg space-y-6 flex flex-col justify-between min-h-[300px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-white border border-slate-200 text-emerald-900 text-xs font-bold rounded-full shadow-sm">
                      {testimonials[currentTestimonial].type}
                    </span>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-800 text-base sm:text-lg font-semibold italic leading-relaxed pt-2">
                    "{testimonials[currentTestimonial].comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center shadow-md">
                      {testimonials[currentTestimonial].avatar}
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">
                        {testimonials[currentTestimonial].name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                      className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-emerald-900 hover:border-emerald-700 shadow-sm transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                      className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-emerald-900 hover:border-emerald-700 shadow-sm transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-emerald-800 font-extrabold text-xs uppercase tracking-widest block">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-black text-slate-900">Got Questions? We Have Answers</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left font-bold text-slate-900 text-base flex justify-between items-center gap-4 hover:text-emerald-800 transition"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-emerald-700 shrink-0" />
                      {faq.question}
                    </span>
                    <span className={`text-xl font-bold transition-transform ${isOpen ? 'rotate-45 text-emerald-700' : 'text-slate-400'}`}>
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-xs text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CONTACT FORM & OFFICE MAP SECTION */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Contact Form */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
              <div>
                <span className="text-emerald-800 font-extrabold text-xs uppercase tracking-widest block">
                  Direct Channel
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">Send Us a Direct Message</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Have a question about a property viewing, land title search, or wholesale store item quote?
                </p>
              </div>

              {formSubmitted ? (
                <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-800 mx-auto" />
                  <h4 className="text-xl font-bold text-slate-900">Message Submitted!</h4>
                  <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
                    Thank you. Our sales and legal advisory team will reach out to you within 2 hours.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="gradient-btn px-6 py-2.5 rounded-xl text-xs font-bold mt-2"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {formError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="e.g. Kwame Mensah"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-700 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Type</label>
                      <select
                        value={contactForm.inquiryType}
                        onChange={(e) => setContactForm({ ...contactForm, inquiryType: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-700 font-semibold"
                      >
                        <option value="GENERAL_CONTACT">General Consultancy</option>
                        <option value="PROPERTY_VIEWING">Property Viewing Request</option>
                        <option value="PRODUCT_QUOTE">Wholesale Store Item Quote</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="name@domain.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-700 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp</label>
                      <input
                        type="tel"
                        required
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        placeholder="+233 24 000 0000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-700 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Message Details</label>
                    <textarea
                      rows={3}
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Specify your inquiry..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-700 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="gradient-btn w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {formLoading ? 'Submitting...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Google Office Location Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-emerald-800 font-extrabold text-xs uppercase tracking-widest block">
                    Head Office
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">Accra Office Location</h3>
                </div>
                <span className="px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-800" /> East Legon
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md h-[300px]">
                <iframe
                  title="Loveridge Office Location Map"
                  src="https://maps.google.com/maps?q=Boundary%20Rd%2C%20Accra%2C%20Ghana&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-emerald-800 shrink-0" />
                  <span>Boundary Rd, East Legon, Accra - Ghana</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-emerald-800 shrink-0" />
                  <span>+233 (0) 24 000 1111</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <ScrollToTop />

      <InquiryModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        type={modalState.type}
        propertyId={modalState.propertyId}
        productId={modalState.productId}
        itemName={modalState.itemName}
      />
    </div>
  );
}
