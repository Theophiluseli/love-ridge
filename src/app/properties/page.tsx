'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import PropertyCardSkeleton from '@/components/PropertyCardSkeleton';
import InquiryModal from '@/components/InquiryModal';
import CurrencySwitcher from '@/components/CurrencySwitcher';
import { Search, SlidersHorizontal, Building2, RotateCcw, ChevronDown, ChevronLeft, ChevronRight, Trees, Warehouse, Building, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { BUILT_PROPERTY_TYPES, isResidentialProperty } from '@/lib/property-categories';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import PageHeroCarousel from '@/components/PageHeroCarousel';

// Client-side module cache for instant sub-millisecond loads
let cachedClientProperties: any[] | null = null;

function PropertiesContent() {
  const searchParams = useSearchParams();
  const [allProperties, setAllProperties] = useState<any[]>(cachedClientProperties || []);
  const [loading, setLoading] = useState(!cachedClientProperties || cachedClientProperties.length === 0);

  // Filter States
  const [listingType, setListingType] = useState(searchParams.get('listingType') || 'ALL');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || 'ALL');
  const [city, setCity] = useState(searchParams.get('city') || 'ALL');
  const [search, setSearch] = useState(searchParams.get('search') || '');

  // Sync state when URL params change (e.g. clicking footer links)
  useEffect(() => {
    const lType = searchParams.get('listingType');
    const pType = searchParams.get('propertyType');
    const cCity = searchParams.get('city');
    const sSearch = searchParams.get('search');
    
    setListingType(lType || 'ALL');
    setPropertyType(pType || 'ALL');
    setCity(cCity || 'ALL');
    setSearch(sSearch || '');
  }, [searchParams]);

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    propertyId?: string;
    itemName?: string;
  }>({ isOpen: false });

  const fetchProperties = useCallback(async (showSkeleton = false, forceFresh = false) => {
    if (showSkeleton) setLoading(true);
    try {
      const url = forceFresh ? `/api/properties?_t=${Date.now()}` : '/api/properties';
      const options = forceFresh ? { cache: 'no-store' as RequestCache } : {};
      const res = await fetch(url, options);
      const data = await res.json();
      if (data.properties && Array.isArray(data.properties)) {
        cachedClientProperties = data.properties;
        setAllProperties(data.properties);
      }
    } catch (err) {
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties(!cachedClientProperties || cachedClientProperties.length === 0, false);
  }, [fetchProperties]);

  // Real-time sync: auto-refetch when any admin or device adds/updates/deletes a property
  useRealtimeSync((type) => {
    if (type === 'properties') {
      cachedClientProperties = null;
      fetchProperties(false, true);
    }
  });

  // Filter properties in-memory instantly (0ms latency, zero screen flicker)
  const filteredProperties = useMemo(() => {
    const result = allProperties.filter((p) => {
      // 1. Search keyword
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitle = p.title?.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q);
        const matchesAddress = p.locationAddress?.toLowerCase().includes(q);
        const matchesCity = p.city?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesAddress && !matchesCity) {
          return false;
        }
      }

      // 2. Listing Type (SALE / RENT)
      if (listingType !== 'ALL') {
        if (p.listingType?.toUpperCase() !== listingType.toUpperCase()) {
          return false;
        }
      }

      // 3. Property Type
      if (propertyType !== 'ALL') {
        const pTypeUpper = propertyType.toUpperCase();
        if (pTypeUpper === 'COMMERCIAL' || pTypeUpper === 'COMMERCIAL_SPACE') {
          const isComm =
            ['LAND', 'OFFICE_SPACE', 'OFFICE', 'WAREHOUSE', 'COMMERCIAL_SPACE', 'RETAIL', 'SHOP'].includes(
              (p.propertyType || '').toUpperCase()
            ) || !isResidentialProperty(p.propertyType);
          if (!isComm) return false;
        } else if (pTypeUpper === 'RESIDENTIAL') {
          if (!isResidentialProperty(p.propertyType)) return false;
        } else {
          if ((p.propertyType || '').toUpperCase() !== pTypeUpper) {
            return false;
          }
        }
      }

      // 4. City
      if (city !== 'ALL') {
        if ((p.city || '').toLowerCase() !== city.toLowerCase()) {
          return false;
        }
      }

      return true;
    });

    // Ensure Favourites occupy the first positions (first 3 roles/rows)
    return [...result].sort((a, b) => {
      const aFav = a.isFavourite ? 1 : 0;
      const bFav = b.isFavourite ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [allProperties, search, listingType, propertyType, city]);

  function resetFilters() {
    setListingType('ALL');
    setPropertyType('ALL');
    setCity('ALL');
    setSearch('');
  }

  const handleSearchClick = () => {
    const el = document.getElementById('property-results');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />

      {/* HERO CAROUSEL SECTION WITH SEARCH FILTER CARD ON TOP */}
      <PageHeroCarousel
        pageKey="properties"
        className="pt-24 sm:pt-28 lg:pt-32 pb-10 sm:pb-14"
        title={
          <>
            Properties & <span className="text-emerald-400">Commercial Listings</span>
          </>
        }
        subtitle="Browse verified luxury villas, residential homes, prime commercial offices, logistics warehouses, and titled lands across Ghana."
      >

          {/* COMPACT SLEEK SEARCH FILTER BOX */}
          <div className="max-w-5xl mx-auto w-full text-left">
            <div className="bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-white/80 shadow-xl shadow-slate-950/40 relative group">
              {/* Top Meta / Utilities Row */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2.5 relative z-10">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-800 shrink-0">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Search Filter</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-semibold normal-case text-xs">
                    <strong className="text-slate-900 font-bold">{filteredProperties.length}</strong> listings
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="hidden sm:inline text-[11px] font-bold text-slate-500">Currency:</span>
                    <CurrencySwitcher />
                  </div>

                  <div className="h-3 w-px bg-slate-200 hidden sm:block" />

                  <button
                    onClick={resetFilters}
                    className="text-[11px] text-emerald-800 font-bold hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                    title="Reset Filters"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Single cohesive row on desktop: 4 Inputs + Search Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 sm:gap-2.5 items-end relative z-10">
                {/* 1. Listing Status */}
                <div className="lg:col-span-3">
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Listing Status</label>
                  <div className="relative">
                    <select
                      value={listingType}
                      onChange={(e) => setListingType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-700 focus:bg-white shadow-xs pr-8 transition-all cursor-pointer"
                    >
                      <option value="ALL">All (Rent & Sale)</option>
                      <option value="SALE">For Sale</option>
                      <option value="RENT">For Rent</option>
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* 2. Property Type */}
                <div className="lg:col-span-3">
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Property Type</label>
                  <div className="relative">
                    <select
                      value={propertyType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPropertyType(val);
                        if (val === 'LAND') {
                          setListingType('SALE');
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-700 focus:bg-white shadow-xs pr-8 transition-all cursor-pointer"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="COMMERCIAL">Commercial & Offices</option>
                      <optgroup label="Dedicated Land Section">
                        <option value="LAND">Land & Plots</option>
                      </optgroup>
                      <optgroup label="Property & Building Units">
                        {BUILT_PROPERTY_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* 3. Location */}
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Location</label>
                  <div className="relative">
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-700 focus:bg-white shadow-xs pr-8 transition-all cursor-pointer"
                    >
                      <option value="ALL">All Cities</option>
                      <option value="Accra">Accra</option>
                      <option value="Tema">Tema</option>
                      <option value="Kumasi">Kumasi</option>
                      <option value="Takoradi">Takoradi</option>
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* 4. Search Keywords */}
                <div className="lg:col-span-2 sm:col-span-2">
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Keywords</label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchClick();
                      }
                    }}
                    placeholder="e.g. Ridge, Spintex..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-700 focus:bg-white shadow-xs transition-all"
                  />
                </div>

                {/* 5. Search Button */}
                <div className="lg:col-span-2 sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleSearchClick}
                    className="w-full h-[37px] px-4 bg-emerald-900 hover:bg-emerald-950 active:scale-[0.98] text-white rounded-xl text-xs font-black shadow-md shadow-emerald-950/20 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-800"
                  >
                    <Search className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

      </PageHeroCarousel>

      {/* Main Results Container */}
      <main id="property-results" className="flex-1 w-full max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 space-y-10">
        {/* Results Header Counter */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 max-w-6xl mx-auto px-1">
          <span>
            Showing <strong className="text-slate-900 font-extrabold">{filteredProperties.length}</strong> matching{' '}
            {propertyType === 'COMMERCIAL' ? 'commercial ' : ''}listings
          </span>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4 max-w-xl mx-auto">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">No Listed Properties Found</h3>
            <p className="text-sm text-slate-600">
              We couldn't find any property matching your search keywords or filter options.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={resetFilters}
                className="bg-slate-100 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {filteredProperties.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onRequestViewing={(id, title) =>
                  setModalState({ isOpen: true, propertyId: id, itemName: title })
                }
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      <InquiryModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false })}
        title="Property Enquiry"
        defaultInquiryType="General Consultancy"
        type="PROPERTY_VIEWING"
        propertyId={modalState.propertyId}
        itemName={modalState.itemName}
      />
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-800 rounded-full animate-spin" />
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
