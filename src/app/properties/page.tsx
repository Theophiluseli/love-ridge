'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import InquiryModal from '@/components/InquiryModal';
import { Search, SlidersHorizontal, Building2, RotateCcw, ChevronDown, Trees, Warehouse, Building } from 'lucide-react';
import Link from 'next/link';
import { BUILT_PROPERTY_TYPES } from '@/lib/property-categories';

const INITIAL_PROPERTIES = [
  {
    id: 'prop-1',
    title: 'Luxury 4-Bedroom Smart Villa with Swimming Pool',
    slug: 'luxury-4-bedroom-smart-villa-east-legon',
    description: 'Contemporary multi-level smart home in East Legon featuring automated lighting, high security, private pool, and staff quarters.',
    listingType: 'SALE',
    propertyType: 'HOUSE',
    price: 450000,
    currency: 'USD',
    pricePeriod: 'outright purchase',
    negotiable: true,
    commission: '5% Standard Agency Fee',
    bedrooms: 4,
    bathrooms: 5,
    sizeSqft: 4500,
    locationAddress: 'Boundary Road, East Legon',
    city: 'Accra',
    region: 'Greater Accra',
    featured: true,
    imageUrl: '/property_villa.png',
  },
  {
    id: 'prop-2',
    title: 'Prime Commercial Land Plot (1.2 Acres) - Cantonments',
    slug: 'prime-commercial-land-cantonments-embassy-quarter',
    description: '1.2 acres of prime commercial land located in Cantonments Embassy Quarter. Fully registered title with Lands Commission clearance.',
    listingType: 'SALE',
    propertyType: 'LAND',
    price: 1800000,
    currency: 'USD',
    pricePeriod: 'outright purchase',
    bedrooms: 0,
    bathrooms: 0,
    sizeSqft: 52272,
    locationAddress: 'Cantonments Embassy Quarter',
    city: 'Accra',
    region: 'Greater Accra',
    featured: true,
    imageUrl: '/property_land.png',
  },
  {
    id: 'prop-3',
    title: 'High-Bay Logistics & Distribution Warehouse (2,500 sqm)',
    slug: 'high-bay-logistics-distribution-warehouse-tema',
    description: 'Modern 2,500 sqm high-bay logistics warehouse facility in Tema Heavy Industrial Area.',
    listingType: 'RENT',
    propertyType: 'WAREHOUSE',
    price: 15000,
    currency: 'USD',
    pricePeriod: 'per month',
    bedrooms: 0,
    bathrooms: 4,
    sizeSqft: 26910,
    locationAddress: 'Harbour Commercial Expressway',
    city: 'Tema',
    region: 'Greater Accra',
    featured: true,
    imageUrl: '/property_warehouse.png',
  },
  {
    id: 'prop-4',
    title: 'Grade-A Executive Office Suite (350 sqm) - Ridge',
    slug: 'grade-a-executive-office-suite-ridge-financial-district',
    description: 'Ultra-modern 350 sqm open-plan commercial office space located in Accra’s premier financial hub in Ridge.',
    listingType: 'RENT',
    propertyType: 'OFFICE_SPACE',
    price: 8750,
    currency: 'USD',
    pricePeriod: 'per month',
    bedrooms: 0,
    bathrooms: 4,
    sizeSqft: 3767,
    locationAddress: 'Financial District, Ridge',
    city: 'Accra',
    region: 'Greater Accra',
    featured: true,
    imageUrl: '/property_villa.png',
  },
];

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>(INITIAL_PROPERTIES);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [listingType, setListingType] = useState('ALL');
  const [propertyType, setPropertyType] = useState('ALL');
  const [city, setCity] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    propertyId?: string;
    itemName?: string;
  }>({ isOpen: false });

  async function fetchProperties() {
    // Only show loading spinner if no property items exist to ensure instant page load
    if (properties.length === 0) {
      setLoading(true);
    }
    try {
      const params = new URLSearchParams();
      if (listingType !== 'ALL') params.append('listingType', listingType);
      if (propertyType !== 'ALL') params.append('propertyType', propertyType);
      if (city !== 'ALL') params.append('city', city);
      if (search) params.append('search', search);

      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      if (data.properties && data.properties.length > 0) {
        setProperties(data.properties);
      }
    } catch (err) {
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProperties();
  }, [listingType, propertyType, city]);

  function resetFilters() {
    setListingType('ALL');
    setPropertyType('ALL');
    setCity('ALL');
    setSearch('');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />

      {/* Main Container with Extra Top Padding for header & filter bar */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-12 space-y-10">
        {/* CENTERED FILTER & SEARCH BAR SECTION */}
        <div className="max-w-5xl mx-auto w-full space-y-6">
          {/* Centered Filter Bar */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800">
                <SlidersHorizontal className="w-4 h-4 text-emerald-700" /> Property Search Filter
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-emerald-800 font-bold hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
              </button>
            </div>

            {/* 4-Column Search Filter Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Listing Status */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-2">Listing Status</label>
                <div className="relative">
                  <select
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value)}
                    className="w-full bg-slate-50/90 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-700 focus:bg-white shadow-2xs pr-10 transition-all cursor-pointer"
                  >
                    <option value="ALL">All (Rent & Sale)</option>
                    <option value="SALE">For Sale</option>
                    <option value="RENT">For Rent / Lease</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* 2. Property Type */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-2">Property Type</label>
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
                    className="w-full bg-slate-50/90 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-700 focus:bg-white shadow-2xs pr-10 transition-all cursor-pointer"
                  >
                    <option value="ALL">All Categories</option>
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
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* 3. Location */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-2">Location</label>
                <div className="relative">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50/90 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-700 focus:bg-white shadow-2xs pr-10 transition-all cursor-pointer"
                  >
                    <option value="ALL">All Cities</option>
                    <option value="Accra">Accra</option>
                    <option value="Tema">Tema</option>
                    <option value="Kumasi">Kumasi</option>
                    <option value="Takoradi">Takoradi</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* 4. Search Keywords */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-2">Search Keywords</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchProperties()}
                    placeholder="e.g. Ridge, Spintex, Tema..."
                    className="w-full bg-slate-50/90 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-700 focus:bg-white shadow-2xs transition-all pr-11"
                  />
                  <button
                    onClick={fetchProperties}
                    title="Search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-emerald-800 text-white hover:bg-emerald-950 flex items-center justify-center transition-all shadow-sm"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm font-semibold">Loading listed properties...</div>
        ) : properties.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4 max-w-xl mx-auto">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">No Listed Properties Found</h3>
            <p className="text-sm text-slate-600">
              We couldn't find any property matching your search keywords or filter options.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={resetFilters} className="bg-slate-100 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200">
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((prop) => (
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
        title="Schedule Property Viewing"
        type="PROPERTY_VIEWING"
        propertyId={modalState.propertyId}
        itemName={modalState.itemName}
      />
    </div>
  );
}
