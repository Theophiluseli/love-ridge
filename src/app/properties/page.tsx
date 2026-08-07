'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import InquiryModal from '@/components/InquiryModal';
import { Search, SlidersHorizontal, Building2, RotateCcw } from 'lucide-react';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [listingType, setListingType] = useState('ALL');
  const [propertyType, setPropertyType] = useState('ALL');
  const [city, setCity] = useState('ALL');
  const [bedrooms, setBedrooms] = useState('ALL');
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    propertyId?: string;
    itemName?: string;
  }>({ isOpen: false });

  async function fetchProperties() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (listingType !== 'ALL') params.append('listingType', listingType);
      if (propertyType !== 'ALL') params.append('propertyType', propertyType);
      if (city !== 'ALL') params.append('city', city);
      if (bedrooms !== 'ALL') params.append('bedrooms', bedrooms);
      if (search) params.append('search', search);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err) {
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProperties();
  }, [listingType, propertyType, city, bedrooms]);

  function resetFilters() {
    setListingType('ALL');
    setPropertyType('ALL');
    setCity('ALL');
    setBedrooms('ALL');
    setSearch('');
    setMaxPrice('');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <span className="text-emerald-800 font-bold text-xs uppercase tracking-widest block">
            Real Estate Catalogue
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Find Properties for Sale & Rent in Ghana
          </h1>
          <p className="text-slate-600 text-sm font-medium">
            Browse verified houses, luxury villas, executive apartments, and commercial land plots.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" /> Search & Filter Properties
            </div>
            <button
              onClick={resetFilters}
              className="text-xs text-emerald-800 font-bold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Listing Status</label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:border-emerald-700"
              >
                <option value="ALL">All (Sale & Rent)</option>
                <option value="SALE">For Sale</option>
                <option value="RENT">For Rent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:border-emerald-700"
              >
                <option value="ALL">All Property Types</option>
                <option value="HOUSE">House / Villa</option>
                <option value="APARTMENT">Apartment</option>
                <option value="DUPLEX">Duplex</option>
                <option value="TOWNHOUSE">Townhouse</option>
                <option value="LAND">Land Plot</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Location</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:border-emerald-700"
              >
                <option value="ALL">All Cities</option>
                <option value="Accra">Accra</option>
                <option value="Kumasi">Kumasi</option>
                <option value="Takoradi">Takoradi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Min Bedrooms</label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:border-emerald-700"
              >
                <option value="ALL">Any Bedrooms</option>
                <option value="1">1+ Bedroom</option>
                <option value="2">2+ Bedrooms</option>
                <option value="3">3+ Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchProperties}
                className="gradient-btn w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" /> Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm">Loading properties...</div>
        ) : properties.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">No Properties Found</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              We couldn't find any property matching your current filter criteria. Try resetting your search filters.
            </p>
            <button onClick={resetFilters} className="gradient-btn px-6 py-2 rounded-xl text-xs font-bold">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onRequestViewing={(id, title) =>
                  setModalState({
                    isOpen: true,
                    propertyId: id,
                    itemName: title,
                  })
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
        title="Book Physical Property Viewing"
        type="PROPERTY_VIEWING"
        propertyId={modalState.propertyId}
        itemName={modalState.itemName}
      />
    </div>
  );
}
