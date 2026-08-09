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
  Star, ChevronLeft, HelpCircle, MapPin, Send, CheckCircle2, Phone, Mail, MessageSquare, Quote, ShieldCheck, ArrowRight, Trees, Warehouse, Layers, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search tab state
  const [activeTab, setActiveTab] = useState<'properties' | 'products'>('properties');
  const [searchQuery, setSearchQuery] = useState('');

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
    inquiryType: 'General Consultancy',
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
      setContactForm({ name: '', email: '', phone: '', message: '', inquiryType: 'General Consultancy' });
    } catch (err: any) {
      setFormError(err.message || 'An error occurred.');
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between bg-grid-pattern relative">
      <Navbar />

      <main className="flex-1 space-y-20 pt-16 sm:pt-24 lg:pt-28 pb-20">
        {/* HERO SECTION */}
        <section className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[950px] h-[480px] bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
            {/* Main Headline & Refined Subtexts */}
            <div className="space-y-4 max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none">
                Welcome To <span className="gradient-text">Loveridge</span>
              </h1>
              
              {/* Refined Subtext 1 */}
              <p className="text-emerald-950 font-bold text-xs sm:text-sm tracking-wider uppercase max-w-xl mx-auto">
                Your Ultimate Destination for Premium Properties & Smart Building Solutions
              </p>

              {/* Refined Intro Subtext 2 */}
              <p className="text-slate-600 text-xs sm:text-sm font-medium max-w-2xl mx-auto leading-relaxed pt-1">
                Loveridge Properties and Consult bridges luxury real estate brokerage in Ghana with direct factory procurement of high-grade building materials, porcelain tiles, and construction tools globally.
              </p>
            </div>

            {/* Dual Search Box */}
            <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xl shadow-emerald-950/10 space-y-4">
              <div className="flex flex-col sm:flex-row bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1.5">
                <button
                  onClick={() => setActiveTab('properties')}
                  className={`flex-1 py-2.5 sm:py-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                    activeTab === 'properties'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-400" /> Search Real Estate Properties
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex-1 py-2.5 sm:py-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                    activeTab === 'products'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Package className="w-4 h-4 text-emerald-400" /> Search Store Products
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      activeTab === 'properties'
                        ? 'Search location, land, office, villa (e.g. East Legon, Spintex)...'
                        : 'Search store supplies (e.g. porcelain tiles, drill kit, smart lock)...'
                    }
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-semibold focus:border-emerald-700 focus:bg-white transition"
                  />
                </div>

                <Link
                  href={
                    activeTab === 'properties'
                      ? `/properties${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`
                      : `/products${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`
                  }
                  className="gradient-btn px-6 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shrink-0"
                >
                  Search Now <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* TRUST FEATURE CARDS ROW */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-8 sm:pt-10 px-2 sm:px-4">
              <div className="bg-white/90 p-5 sm:px-6 sm:py-5.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-all text-left">
                <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                  <Home className="w-5 h-5 text-emerald-800" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight">Luxury Homes</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    Verified land, villas & apartments
                  </p>
                </div>
              </div>

              <div className="bg-white/90 p-5 sm:px-6 sm:py-5.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-all text-left">
                <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                  <Clock className="w-5 h-5 text-emerald-800" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight">100% Trusted</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    Clear title verification & legal search
                  </p>
                </div>
              </div>

              <div className="bg-white/90 p-5 sm:px-6 sm:py-5.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-all text-left">
                <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                  <Layers className="w-5 h-5 text-emerald-800" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight">Quality Materials</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    Direct factory procurement globally
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 1. ABOUT OUR FIRM SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left Skyscraper Image Container */}
            <div className="relative rounded-3xl overflow-hidden shadow-lg h-[420px] sm:h-[480px]">
              <img
                src="/signature_apartment_accra.png"
                alt="The Signature Luxury Apartments (East Legon / Accra Mall)"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 sm:p-8">
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest mb-1">
                  GLOBAL REAL ESTATE & DIRECT PROCUREMENT
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Loveridge Properties & Consult
                </h3>
              </div>
            </div>

            {/* Right Content */}
            <div className="space-y-5 text-slate-700">
              <span className="text-emerald-800 text-xs font-bold uppercase tracking-widest block">
                ABOUT OUR FIRM
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Welcome To Loveridge
              </h2>

              <p className="text-xs sm:text-sm leading-relaxed font-medium text-slate-600">
                At Loveridge Properties and Consult, we cultivate a flexible and inclusive work culture, leveraging remote and hybrid models to support our global team while addressing the evolving demands of the real estate industry.
              </p>

              <p className="text-xs sm:text-sm leading-relaxed font-medium text-slate-600">
                Our expertise includes luxury homes, property renovation and management, property sales and rentals, brokerage, advisory services, and strategic investments. As a leader in sourcing and exporting building materials, tools, and equipment from China, we provide streamlined solutions for construction and renovation projects tailored to all economic levels.
              </p>

              <p className="text-xs sm:text-sm leading-relaxed font-medium text-slate-600">
                Our mission is to simplify the global home-buying and renting process while optimizing the sourcing and export of essential materials. We are committed to ensuring families worldwide enjoy comfortable, stylish homes by transforming real estate experiences with excellence and practicality.
              </p>

              <div className="pt-3 flex flex-wrap items-center gap-4">
                <Link
                  href="/properties"
                  className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-6 py-3.5 rounded-2xl text-xs flex items-center gap-2 shadow-md transition-all"
                >
                  Explore Luxury Properties <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/products"
                  className="border-2 border-emerald-900 text-emerald-950 hover:bg-emerald-50 font-bold px-6 py-3.5 rounded-2xl text-xs transition-all"
                >
                  Visit Our Store
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED PROPERTIES SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-10 sm:pt-16 lg:pt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-emerald-800 font-bold text-xs uppercase tracking-widest block mb-1">
                VERIFIED LISTINGS
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Featured Verified Properties
              </h2>
            </div>
            <Link
              href="/properties"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 group"
            >
              Explore All Properties <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">Loading properties...</div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    hidePropertyType={true}
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
              <div className="flex justify-center pt-2">
                <Link
                  href="/properties"
                  className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-extrabold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group border border-slate-800"
                >
                  View More Properties <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* 2. STORE PRODUCTS HIGHLIGHT SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-50/60 p-8 sm:p-12 rounded-3xl border border-emerald-100/80 shadow-xs space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-emerald-200/60 pb-4">
              <div>
                <span className="text-emerald-800 font-extrabold text-xs uppercase tracking-widest block mb-1">
                  DIRECT IMPORTS & HARDWARE
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Featured Products
                </h2>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 group"
              >
                Explore Full Store <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-sm">Loading store inventory...</div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onRequestQuote={(id, name) =>
                        setModalState({
                          isOpen: true,
                          type: 'PRODUCT_QUOTE',
                          title: 'Request Material Quotation',
                          productId: id,
                          itemName: name,
                        })
                      }
                    />
                  ))}
                </div>

                {/* View More Products Button */}
                <div className="flex justify-center pt-2">
                  <Link
                    href="/products"
                    className="px-8 py-3.5 bg-emerald-900 hover:bg-emerald-950 text-white rounded-2xl text-xs font-extrabold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group border border-emerald-800"
                  >
                    View More Products <ArrowRight className="w-4 h-4 text-emerald-300 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 3. CLIENT EXPERIENCES / TESTIMONIALS SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            {/* Left Header Column */}
            <div className="lg:col-span-2 space-y-4">
              <span className="text-emerald-800 font-bold text-xs uppercase tracking-widest block">
                CLIENT EXPERIENCES
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight tracking-tight">
                Trusted by Homeowners & Commercial Developers
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                Hear how our legal title guarantee and direct international factory sourcing transform property acquisitions and construction projects in Ghana.
              </p>

              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-900">4.9 / 5.0 Rating</span>
                </div>
                <p className="text-[11px] text-slate-500 font-bold">100+ Verified Transactions</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> VERIFIED REVIEWS
                </div>
              </div>
            </div>

            {/* Right Dynamic Testimonial Card */}
            <div className="lg:col-span-3 bg-slate-50/90 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6 relative">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 text-[11px] font-extrabold">
                  {testimonials[currentTestimonial].type}
                </span>
              </div>

              <p className="text-slate-800 text-sm sm:text-base italic font-semibold leading-relaxed">
                "{testimonials[currentTestimonial].comment}"
              </p>

              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
                    }
                    className="w-8 h-8 rounded-full border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
                    }
                    className="w-8 h-8 rounded-full border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CONTACT / DIRECT MESSAGE & ACCRA OFFICE LOCATION SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Card: Send Us a Direct Message */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
              <div className="space-y-2">
                <span className="text-emerald-800 font-extrabold text-xs uppercase tracking-widest block">
                  DIRECT CHANNEL
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Send Us a Direct Message</h2>
                <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
                  Have a question about a property viewing, land title search, or wholesale store item quote?
                </p>
              </div>

              {formSubmitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900">Thank You for Reaching Out!</h3>
                  <p className="text-slate-600 text-xs max-w-md mx-auto">
                    Our team has received your message and will respond within 24 hours.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="px-5 py-2.5 bg-emerald-900 text-white font-bold rounded-xl text-xs hover:bg-emerald-950 transition"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {formError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="e.g. Kwame Mensah"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 sm:px-4 text-xs sm:text-sm text-slate-900 font-medium focus:border-emerald-700 focus:bg-white focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Inquiry Type</label>
                      <select
                        value={contactForm.inquiryType}
                        onChange={(e) => setContactForm({ ...contactForm, inquiryType: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 sm:px-4 text-xs sm:text-sm text-slate-900 font-semibold focus:border-emerald-700 focus:bg-white focus:outline-none transition"
                      >
                        <option value="General Consultancy">General Consultancy</option>
                        <option value="PROPERTY_VIEWING">Property Viewing</option>
                        <option value="PRODUCT_QUOTE">Wholesale Store Quote</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="name@domain.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 sm:px-4 text-xs sm:text-sm text-slate-900 font-medium focus:border-emerald-700 focus:bg-white focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone / WhatsApp</label>
                      <input
                        type="tel"
                        required
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        placeholder="+233 24 000 0000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 sm:px-4 text-xs sm:text-sm text-slate-900 font-medium focus:border-emerald-700 focus:bg-white focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Message Details</label>
                    <textarea
                      rows={3}
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Specify your inquiry..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm text-slate-900 font-medium focus:border-emerald-700 focus:bg-white focus:outline-none transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full py-3.5 sm:py-4 bg-emerald-900 hover:bg-emerald-950 text-white rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Send className="w-4 h-4" /> {formLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Right Card: Accra Office Location */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-800 font-extrabold text-xs uppercase tracking-widest block">
                    HEAD OFFICE
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 text-[11px] font-extrabold border border-emerald-200">
                    📍 EAST LEGON
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Accra Office Location</h2>

                {/* Map Box */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-[240px] sm:h-[270px] bg-slate-100">
                  <iframe
                    title="Accra Office Location Map"
                    src="https://maps.google.com/maps?q=Boundary%20Road,%20East%20Legon,%20Accra,%20Ghana&t=&z=14&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                  <a
                    href="https://maps.google.com/?q=Boundary+Road,+East+Legon,+Accra,+Ghana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-emerald-950 flex items-center gap-1.5 shadow-sm hover:bg-slate-50 transition"
                  >
                    Open in Maps <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                  </a>
                </div>
              </div>

              {/* Bottom Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-slate-700 text-xs font-bold">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Boundary Rd, East Legon, Accra - Ghana</span>
                </div>
                <div className="flex items-center gap-2.5 sm:justify-end">
                  <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>+233 (0) 24 000 1111</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-emerald-800 font-extrabold text-xs uppercase tracking-widest">GOT QUESTIONS?</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-900 text-sm sm:text-base hover:bg-slate-50 transition"
                  >
                    <span>{faq.question}</span>
                    <ChevronRight className={`w-4 h-4 text-emerald-800 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-slate-600 text-xs sm:text-sm font-medium border-t border-slate-100 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />

      <InquiryModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        type={modalState.type}
        propertyId={modalState.propertyId}
        productId={modalState.productId}
        itemName={modalState.itemName}
      />

      <ScrollToTop />
    </div>
  );
}
