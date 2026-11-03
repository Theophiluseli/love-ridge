'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeroCarousel from '@/components/PageHeroCarousel';
import BusinessCard from '@/components/BusinessCard';
import {
  Briefcase,
  Search,
  SlidersHorizontal,
  Building2,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  X,
} from 'lucide-react';
import {
  INITIAL_BUSINESSES_STORE,
  PublicBusinessItem,
  sanitizeBusinessForPublic,
} from '@/lib/businesses-constants';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<PublicBusinessItem[]>(() =>
    INITIAL_BUSINESSES_STORE.filter((b) => b.status === 'PUBLISHED').map(sanitizeBusinessForPublic)
  );
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'price-desc' | 'price-asc' | 'sde-desc'>('featured');

  const fetchBusinesses = useCallback(async (bustCache = false) => {
    try {
      const qs = bustCache ? `?_t=${Date.now()}` : '';
      const res = await fetch(`/api/businesses${qs}`, {
        cache: bustCache ? 'no-store' : 'default',
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.businesses)) {
        setBusinesses(data.businesses);
      }
    } catch (err) {
      console.error('Failed to fetch businesses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses(false);
  }, [fetchBusinesses]);

  useRealtimeSync((catalog) => {
    if (catalog === 'businesses') {
      fetchBusinesses(true);
    }
  });

  // Dynamic list of available categories from published listings
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    businesses.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [businesses]);

  const filteredBusinesses = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    const list = businesses.filter((b) => {
      const matchesCategory =
        selectedCategory === 'ALL' ||
        b.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.region.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price-desc') return (b.askingPrice || 0) - (a.askingPrice || 0);
      if (sortBy === 'price-asc') return (a.askingPrice || 0) - (b.askingPrice || 0);
      if (sortBy === 'sde-desc') {
        return (b.sellersDiscretionaryEarnings || 0) - (a.sellersDiscretionaryEarnings || 0);
      }
      const aFav = a.isFavourite || a.featured ? 1 : 0;
      const bFav = b.isFavourite || b.featured ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [businesses, searchTerm, selectedCategory, sortBy]);

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Banner with Home Page Hero Carousel */}
      <PageHeroCarousel
        pageKey="businesses"
        badge={{
          icon: <Briefcase className="w-3.5 h-3.5 text-amber-400" />,
          text: 'Businesses & Commercial Acquisitions',
        }}
        title={
          <>
            Verified Operating Businesses &amp;{' '}
            <span className="text-emerald-400">Turnkey Assets for Sale</span>
          </>
        }
        subtitle="Explore vetted hospitality, commercial real-property businesses, and profitable turnkey enterprises across Ghana. Click any listing below to inspect full operational descriptions, discretionary earnings, and acquisition terms."
      >
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
          <div className="flex items-center justify-center gap-2.5 bg-slate-950/60 border border-white/15 rounded-xl px-4 py-3 backdrop-blur-md">
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-white">
              Real Property &amp; Going Concerns
            </span>
          </div>
          <div className="flex items-center justify-center gap-2.5 bg-slate-950/60 border border-white/15 rounded-xl px-4 py-3 backdrop-blur-md">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-white">
              Verified SDE &amp; Cash Flow
            </span>
          </div>
          <div className="flex items-center justify-center gap-2.5 bg-slate-950/60 border border-white/15 rounded-xl px-4 py-3 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-white">
              Confidential Advisory
            </span>
          </div>
        </div>
      </PageHeroCarousel>

      {/* Filter & Search Bar */}
      <section className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by business title, sector, or location (e.g. Boutique Hotel, Accra)..."
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900 placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                {availableCategories.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        active
                          ? 'bg-emerald-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'ALL' ? 'All Sectors' : cat}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 ml-auto md:ml-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="featured">Sort: Featured First</option>
                  <option value="price-desc">Asking Price: High to Low</option>
                  <option value="price-asc">Asking Price: Low to High</option>
                  <option value="sde-desc">Highest Discretionary Earnings</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Listed Businesses Grid */}
      <section className="flex-1 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-medium text-slate-600">
              Showing <strong className="text-slate-900">{filteredBusinesses.length}</strong>{' '}
              {filteredBusinesses.length === 1 ? 'listed business' : 'listed businesses'}
            </p>
            {(searchTerm || selectedCategory !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                }}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
              >
                Reset filters
              </button>
            )}
          </div>

          {loading && businesses.length === 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-80 rounded-2xl bg-slate-200/70 animate-pulse border border-slate-200"
                />
              ))}
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-8 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No Matching Business Listings
              </h3>
              <p className="text-slate-600 text-sm mb-6">
                We couldn&apos;t find any businesses matching your current filter criteria. Try clearing your search or contact our advisory desk for off-market opportunities.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-900 text-white text-sm font-bold hover:bg-emerald-800 transition-colors"
              >
                Show All Listed Businesses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {filteredBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Advisory / Sell Your Business Banner */}
      <section className="py-12 sm:py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 p-8 sm:p-12 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-xl">
            <div className="max-w-2xl">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
                Confidential M&amp;A &amp; Business Brokerage
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                Looking to Acquire or Confidentially Sell a Business in Ghana?
              </h2>
              <p className="text-emerald-100/85 text-sm sm:text-base leading-relaxed">
                Loveridge Properties &amp; Consult represents vetted business owners, hoteliers, and commercial property operators. Contact our corporate advisory team for private memorandums, financial due diligence, or to list your enterprise.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg"
              >
                Speak with an Advisor
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://wa.me/233246432493"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold text-sm transition-all"
              >
                WhatsApp Advisory Desk
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
