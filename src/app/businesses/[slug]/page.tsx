'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BusinessCard, { formatBusinessAmount } from '@/components/BusinessCard';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  MapPin,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Briefcase,
  ShieldCheck,
  PhoneCall,
  Send,
  Sparkles,
  FileText,
  HelpCircle,
  Layers,
} from 'lucide-react';
import {
  INITIAL_BUSINESSES_STORE,
  PublicBusinessItem,
  sanitizeBusinessForPublic,
} from '@/lib/businesses-constants';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

export default function BusinessDetailPage({ params }: { params: { slug: string } }) {
  const cleanSlug = decodeURIComponent(params?.slug || '').toLowerCase().trim();

  const initialMatch = INITIAL_BUSINESSES_STORE.find(
    (b) => b.slug.toLowerCase() === cleanSlug || b.id.toLowerCase() === cleanSlug
  );

  const [business, setBusiness] = useState<PublicBusinessItem | null>(() =>
    initialMatch ? sanitizeBusinessForPublic(initialMatch) : null
  );
  const [related, setRelated] = useState<PublicBusinessItem[]>([]);
  const [loading, setLoading] = useState<boolean>(!initialMatch);
  const [activePhoto, setActivePhoto] = useState<string>(initialMatch?.imageUrl || '');

  // Confidential Inquiry Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [investorProfile, setInvestorProfile] = useState('Individual / Private Buyer');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    async function loadBusiness() {
      if (!params?.slug) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/businesses/${params.slug}?_t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.business) {
            setBusiness(data.business);
            if (data.business.imageUrl) {
              setActivePhoto(data.business.imageUrl);
            }
            if (Array.isArray(data.related)) {
              setRelated(data.related);
            }
          } else {
            setBusiness(null);
          }
        } else if (!initialMatch) {
          setBusiness(null);
        }
      } catch (err) {
        console.error('Business detail fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBusiness();
  }, [params?.slug]);

  useRealtimeSync((catalog) => {
    if (catalog === 'businesses' && params?.slug) {
      fetch(`/api/businesses/${params.slug}?_t=${Date.now()}`, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.business) {
            setBusiness(data.business);
            if (Array.isArray(data.related)) setRelated(data.related);
          }
        })
        .catch(() => null);
    }
  });

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          source: 'WEBSITE',
          inquiryType: 'BUSINESS_ACQUISITION',
          subject: `Business Acquisition Inquiry: ${business.title}`,
          message: `[Business Listing: ${business.title} (${business.category}) | Asking Price: ${formatBusinessAmount(
            business.askingPrice,
            business.currency
          )} | Buyer Profile: ${investorProfile}]\n\n${
            message || 'I would like to receive the confidential information memorandum and full financials for this business.'
          }`,
        }),
      });

      if (!res.ok) {
        throw new Error('Could not submit inquiry. Please try again.');
      }

      setSubmitted(true);
      setFullName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to send inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-28 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-800 rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Loading Business Dossier...</h2>
        </main>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-28 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Business Listing Not Found</h1>
          <p className="text-slate-600 text-base max-w-md mx-auto">
            The business opportunity you are looking for may have been acquired, moved off-market, or is currently unavailable.
          </p>
          <div>
            <Link
              href="/businesses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-900 text-white font-bold text-sm hover:bg-emerald-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Businesses
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currency = business.currency || 'USD';
  const gallery = Array.from(
    new Set([business.imageUrl, ...(business.galleryUrls || [])].filter(Boolean) as string[])
  );
  const paragraphs: string[] = (business.description || '')
    .split(/\n\s*\n/)
    .map((p: string) => p.trim())
    .filter(Boolean);

  const whatsappMessage = encodeURIComponent(
    `Hello Loveridge Corporate Advisory, I am interested in the listed business: "${business.title}" (Asking Price: ${formatBusinessAmount(
      business.askingPrice,
      currency
    )}). Please share the confidential details.`
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Top Breadcrumb & Back Navigation */}
      <div className="pt-24 sm:pt-28 pb-4 bg-[#f4f6ee] border-b border-slate-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/businesses"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-800 hover:text-emerald-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Listed Businesses
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Businesses</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">{business.category}</span>
          </div>
        </div>
      </div>

      {/* Signature Header Banner Matching Reference Screenshot */}
      <section className="bg-[#f4f6ee] border-b border-slate-900/15 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-base sm:text-lg font-normal text-slate-900 mb-3">
              {business.category || 'Real Property Rltd'}
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium text-slate-950 leading-[1.18] tracking-tight">
              {business.title}
            </h1>

            <hr className="border-t border-slate-900/75 my-6 sm:my-8" />

            <div className="space-y-3 text-base sm:text-lg md:text-xl leading-snug text-slate-950">
              <p>
                <span className="font-normal text-slate-900">Location: </span>
                <strong className="font-bold text-slate-950">
                  {business.location || `${business.city}, ${business.region}`}
                </strong>
              </p>

              <p>
                <span className="font-normal text-slate-900">Asking Price: </span>
                <strong className="font-bold text-slate-950">
                  {formatBusinessAmount(business.askingPrice, currency)}
                </strong>
              </p>

              <p>
                <span className="font-normal text-slate-900">Down Payment: </span>
                <strong className="font-bold text-slate-950">
                  {business.downPayment !== null && business.downPayment !== undefined
                    ? formatBusinessAmount(business.downPayment, currency)
                    : 'Upon Request'}
                </strong>
              </p>

              <p>
                <span className="font-normal text-slate-900">
                  Sellers Discretionary Earnings:{' '}
                </span>
                <strong className="font-bold text-slate-950">
                  {business.sellersDiscretionaryEarnings !== null &&
                  business.sellersDiscretionaryEarnings !== undefined
                    ? formatBusinessAmount(business.sellersDiscretionaryEarnings, currency)
                    : 'Disclosed Upon NDA'}
                </strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar */}
      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Full Business Description & Details (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Optional Gallery if images exist */}
              {gallery.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="relative aspect-[16/9] w-full bg-slate-100">
                    <img
                      src={activePhoto || gallery[0]}
                      alt={business.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {gallery.length > 1 && (
                    <div className="p-4 flex items-center gap-3 overflow-x-auto">
                      {gallery.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActivePhoto(imgUrl)}
                          className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                            (activePhoto || gallery[0]) === imgUrl
                              ? 'border-emerald-700 scale-105'
                              : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Full Business Description */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-9 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    Full Business Description
                  </h2>
                </div>

                {business.summary && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#f4f6ee] border border-slate-900/10 text-slate-900 font-medium text-sm sm:text-base leading-relaxed mb-6">
                    {business.summary}
                  </div>
                )}

                <div className="space-y-4 text-slate-700 text-base sm:text-[17px] leading-relaxed">
                  {paragraphs.length > 0 ? (
                    paragraphs.map((para: string, index: number) => (
                      <p key={index} className="whitespace-pre-line">
                        {para}
                      </p>
                    ))
                  ) : (
                    <p>
                      Contact Loveridge Corporate Advisory for the complete confidential information memorandum and financial statements for this business opportunity.
                    </p>
                  )}
                </div>
              </div>

              {/* Investment & Operational Highlights */}
              {Array.isArray(business.highlights) && business.highlights.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-9 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      Key Investment &amp; Operational Highlights
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {business.highlights.map((item: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base font-medium text-slate-800 leading-snug">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial & Operational Metrics Table */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-9 shadow-sm">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    Financial &amp; Operational Profile
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#f4f6ee] border border-slate-900/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Asking Price
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-slate-950">
                      {formatBusinessAmount(business.askingPrice, currency)}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#f4f6ee] border border-slate-900/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Down Payment
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-slate-950">
                      {business.downPayment !== null && business.downPayment !== undefined
                        ? formatBusinessAmount(business.downPayment, currency)
                        : 'Upon Request'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#f4f6ee] border border-slate-900/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Sellers Discretionary Earnings (SDE)
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-emerald-900">
                      {business.sellersDiscretionaryEarnings !== null &&
                      business.sellersDiscretionaryEarnings !== undefined
                        ? formatBusinessAmount(business.sellersDiscretionaryEarnings, currency)
                        : 'Disclosed Upon NDA'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Annual Gross Revenue
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-slate-900">
                      {business.grossRevenue !== null && business.grossRevenue !== undefined
                        ? formatBusinessAmount(business.grossRevenue, currency)
                        : 'Available in Data Room'}
                    </span>
                  </div>

                  {business.inventoryValue !== null && business.inventoryValue !== undefined && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        FF&amp;E / Inventory Included
                      </span>
                      <span className="text-lg font-bold text-slate-900">
                        {formatBusinessAmount(business.inventoryValue, currency)}
                      </span>
                    </div>
                  )}

                  {business.realEstateIncluded && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Real Property Status
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {typeof business.realEstateIncluded === 'boolean'
                          ? 'Real Property Included (Freehold / Titled)'
                          : business.realEstateIncluded}
                      </span>
                    </div>
                  )}

                  {business.establishedYear && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-emerald-700 shrink-0" />
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                          Established
                        </span>
                        <span className="text-base font-bold text-slate-900">
                          {business.establishedYear}
                        </span>
                      </div>
                    </div>
                  )}

                  {business.employees && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                      <Users className="w-5 h-5 text-emerald-700 shrink-0" />
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                          Workforce / Staff
                        </span>
                        <span className="text-base font-bold text-slate-900">
                          {business.employees}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Facilities, Growth & Transition Details */}
              {(business.facilitiesOverview ||
                business.growthOpportunities ||
                business.supportAndTraining ||
                business.reasonForSelling) && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-9 shadow-sm space-y-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      Property, Growth &amp; Handover Details
                    </h2>
                  </div>

                  {business.facilitiesOverview && (
                    <div className="border-b border-slate-100 pb-5">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 mb-2">
                        Facilities &amp; Real Estate Overview
                      </h3>
                      <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                        {business.facilitiesOverview}
                      </p>
                    </div>
                  )}

                  {business.growthOpportunities && (
                    <div className="border-b border-slate-100 pb-5">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 mb-2">
                        Expansion &amp; Growth Potential
                      </h3>
                      <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                        {business.growthOpportunities}
                      </p>
                    </div>
                  )}

                  {business.supportAndTraining && (
                    <div className="border-b border-slate-100 pb-5">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 mb-2">
                        Transition Support &amp; Training
                      </h3>
                      <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                        {business.supportAndTraining}
                      </p>
                    </div>
                  )}

                  {business.reasonForSelling && (
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 mb-2">
                        Reason for Sale
                      </h3>
                      <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                        {business.reasonForSelling}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Confidential Inquiry Sidebar (4 cols) */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-lg">
                <div className="flex items-center gap-2.5 mb-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                    Confidential Acquisition Desk
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                  Request Full Memorandum
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
                  Inquire below to receive the confidential prospectus, audited cash-flow schedules, and private inspection arrangement.
                </p>

                {submitted ? (
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
                    <h4 className="text-base font-bold text-slate-900">
                      Confidential Inquiry Received
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Our senior M&amp;A advisor has received your request for{' '}
                      <strong>{business.title}</strong> and will contact you shortly.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-xs font-bold text-emerald-800 underline"
                    >
                      Send another inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+233 ..."
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Buyer Profile
                      </label>
                      <select
                        value={investorProfile}
                        onChange={(e) => setInvestorProfile(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
                      >
                        <option value="Individual / Private Buyer">Individual / Private Buyer</option>
                        <option value="Corporate / Strategic Acquirer">Corporate / Strategic Acquirer</option>
                        <option value="Private Equity / Family Office">Private Equity / Family Office</option>
                        <option value="Diaspora Investor">Diaspora Investor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Message or Questions
                      </label>
                      <textarea
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="I am interested in the full business description, financials, and scheduling a confidential discussion..."
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
                      />
                    </div>

                    {submitError && (
                      <p className="text-xs font-semibold text-red-600">{submitError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-emerald-900 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-md"
                    >
                      <Send className="w-4 h-4" />
                      {submitting ? 'Submitting Request...' : 'Request Business Dossier'}
                    </button>
                  </form>
                )}

                <div className="mt-5 pt-5 border-t border-slate-100 space-y-2.5">
                  <a
                    href={`https://wa.me/233246432493?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs sm:text-sm transition-colors"
                  >
                    Inquire Instantly via WhatsApp
                  </a>
                  <a
                    href="tel:+233246432493"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-colors"
                  >
                    <PhoneCall className="w-4 h-4" />
                    Call Advisory Desk: +233 24 643 2493
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Related Businesses */}
          {related.length > 0 && (
            <div className="mt-16 pt-12 border-t border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Other Listed Business Opportunities
                </h2>
                <Link
                  href="/businesses"
                  className="text-sm font-bold text-emerald-800 hover:text-emerald-950"
                >
                  View All &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {related.map((item) => (
                  <BusinessCard key={item.id} business={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
