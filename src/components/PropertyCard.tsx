'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bed, Bath, Maximize2, MapPin, Building, Warehouse as WarehouseIcon, Trees, Clock, Home, Check, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { formatPropertyType } from '@/lib/property-categories';

interface PropertyProps {
  property: {
    id: string;
    title: string;
    slug: string;
    description: string;
    listingType: string; // SALE, RENT
    propertyType: string;
    price: number;
    currency: string;
    pricePeriod?: string | null;
    negotiable?: boolean | null;
    commission?: string | null;
    bedrooms: number;
    bathrooms: number;
    guestRooms?: number | null;
    boysQuarters?: number | null;
    garage?: number | null;
    sizeSqft?: number | null;
    livingAreaSqft?: number | null;
    locationAddress: string;
    city: string;
    featured?: boolean;
    imageUrl?: string;
    galleryUrls?: string[];
    images?: string[];
    updatedAt?: string | Date;
    createdAt?: string | Date;
  };
  onRequestViewing?: (propertyId: string, title: string) => void;
  hidePropertyType?: boolean;
}

export default function PropertyCard({ property, onRequestViewing, hidePropertyType = false }: PropertyProps) {
  const { formatPrice } = useCurrency();
  const isRent = property.listingType === 'RENT';
  const propType = (property.propertyType || '').toUpperCase();

  // Determine fallback property picture (ultra-fast WebP)
  const fallbackImg = (() => {
    if (propType === 'OFFICE_SPACE' || propType === 'OFFICE' || property.slug?.includes('office')) {
      return '/property_office.webp';
    } else if (propType === 'WAREHOUSE' || property.slug?.includes('warehouse')) {
      return '/property_warehouse.webp';
    } else if (propType === 'LAND' || property.slug?.includes('land')) {
      return '/property_land.webp';
    } else if (property.slug?.includes('apartment') || propType === 'APARTMENT') {
      return '/property_apartment.webp';
    } else {
      return '/property_villa.webp';
    }
  })();

  // Aggregate all unique property photos (prefer WebP)
  const rawImages = [
    property.imageUrl,
    ...(Array.isArray(property.galleryUrls) ? property.galleryUrls : []),
    ...(Array.isArray((property as any).images) ? (property as any).images : []),
  ]
    .filter(Boolean)
    .map((url) => {
      if (typeof url === 'string') {
        if (url === '/property_villa.png') return '/property_villa.webp';
        if (url === '/property_land.png') return '/property_land.webp';
        if (url === '/property_office.png') return '/property_office.webp';
        if (url === '/property_warehouse.png') return '/property_warehouse.webp';
        if (url === '/property_apartment.png') return '/property_apartment.webp';
      }
      return url;
    }) as string[];

  const imagesList = Array.from(new Set(rawImages.length > 0 ? rawImages : [fallbackImg]));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const hasMultipleImages = imagesList.length > 1;
  const currentImg = imagesList[currentImageIndex] || fallbackImg;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || !hasMultipleImages) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setCurrentImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
      } else {
        setCurrentImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
      }
    }
    setTouchStartX(null);
  };

  const formattedTypeLabel = formatPropertyType(property.propertyType);

  const formatPeriod = (period?: string | null) => {
    if (!period) return null;
    const p = period.trim();
    if (p.toLowerCase() === 'outright purchase') return 'Outright Purchase';
    if (p.toLowerCase() === 'per month') return 'Per Month';
    if (p.toLowerCase() === 'per year' || p.toLowerCase() === 'per annum') return 'Per Year';
    return p;
  };

  const formattedPrice = formatPrice(property.price, property.currency || 'GHS');

  const updatedDate = property.updatedAt || property.createdAt;
  const timeAgo = updatedDate
    ? new Date(updatedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between group h-full border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Property Cover Image Carousel Frame - Generously Sized */}
      <div
        className="relative h-60 sm:h-72 lg:h-80 xl:h-88 bg-slate-100 overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Link href={`/properties/${property.slug}`} className="block w-full h-full">
          <img
            key={currentImg}
            src={currentImg}
            alt={`${property.title} - Photo ${currentImageIndex + 1}`}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent z-10 pointer-events-none" />

        {/* Status Badges */}
        <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-20 flex gap-2 pointer-events-none">
          <span
            className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md ${
              propType === 'LAND' || !isRent ? 'bg-emerald-600 text-white' : 'bg-emerald-800 text-white'
            }`}
          >
            FOR {propType === 'LAND' ? 'SALE' : property.listingType}
          </span>
          {property.featured && (
            <span className="bg-red-600 text-white px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
              FEATURED
            </span>
          )}
        </div>

        {/* Left & Right Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/70 hover:bg-slate-950/95 active:scale-90 text-white border border-white/25 shadow-lg backdrop-blur-md flex items-center justify-center transition-all duration-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 cursor-pointer"
              title="Previous photo"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>

            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/70 hover:bg-slate-950/95 active:scale-90 text-white border border-white/25 shadow-lg backdrop-blur-md flex items-center justify-center transition-all duration-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 cursor-pointer"
              title="Next photo"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </>
        )}

        <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-4 sm:left-4 sm:right-4 z-20 flex flex-wrap items-end justify-between gap-2">
          <div className="flex flex-col min-w-0 max-w-full">
            <div className="flex items-baseline flex-wrap gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                {formattedPrice}
              </span>
              {property.pricePeriod && (
                <span className="inline-flex items-center text-xs font-bold text-emerald-300 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-emerald-500/40 whitespace-nowrap shadow-sm">
                  {formatPeriod(property.pricePeriod)}
                </span>
              )}
              {property.negotiable && (
                <span className="inline-flex items-center text-xs font-bold text-blue-200 bg-blue-950/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-blue-500/40 whitespace-nowrap shadow-sm gap-1">
                  <Check className="w-3 h-3 stroke-[3] text-blue-400" /> Negotiable
                </span>
              )}
            </div>
          </div>
          {!hidePropertyType && (
            <span className="text-xs font-bold text-slate-900 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md shrink-0">
              {formattedTypeLabel}
            </span>
          )}
        </div>
      </div>

      {/* Body - Generously Spaced */}
      <div className="p-5 sm:p-6 lg:p-7 flex-1 flex flex-col justify-between space-y-4 sm:space-y-5">
        <div>
          <div className="flex items-center justify-between text-slate-500 text-xs sm:text-sm mb-2 font-medium">
            <div className="flex items-center gap-1.5 min-w-0 pr-2">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="truncate">{property.locationAddress}, {property.city}</span>
            </div>
            {timeAgo && (
              <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> {timeAgo}
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
            {property.title}
          </h3>

          <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 mt-2 leading-relaxed font-normal">
            {property.description}
          </p>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 py-3 sm:py-4 border-y border-slate-100 text-xs sm:text-sm text-slate-700 font-semibold text-center">
          {propType === 'LAND' ? (
            <>
              <div className="flex flex-col items-center">
                <Trees className="w-4 h-4 text-emerald-700 mb-1" />
                <span>Land</span>
              </div>
              <div className="flex flex-col items-center">
                <MapPin className="w-4 h-4 text-emerald-700 mb-1" />
                <span>Titled</span>
              </div>
              <div className="col-span-2 flex flex-col items-center">
                <Maximize2 className="w-4 h-4 text-emerald-700 mb-1" />
                <span>{property.sizeSqft ? `${(property.sizeSqft / 43560).toFixed(1)} Acres` : 'Land Plot'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center" title="Bedrooms">
                <Bed className="w-4 h-4 text-emerald-700 mb-1" />
                <span>{property.bedrooms || 0} Beds</span>
              </div>
              <div className="flex flex-col items-center" title="Bathrooms">
                <Bath className="w-4 h-4 text-emerald-700 mb-1" />
                <span>{property.bathrooms || 0} Baths</span>
              </div>
              <div className="flex flex-col items-center" title="Guest Rooms">
                <Home className="w-4 h-4 text-emerald-700 mb-1" />
                <span>{property.guestRooms || 0} Guest</span>
              </div>
              <div className="flex flex-col items-center" title="Total Size Sqft">
                <Maximize2 className="w-4 h-4 text-emerald-700 mb-1" />
                <span>{property.livingAreaSqft || property.sizeSqft || 100} sqft</span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 pt-1">
          <Link
            href={`/properties/${property.slug}`}
            className="flex-1 py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl border border-slate-300 hover:border-emerald-700 text-slate-700 text-xs sm:text-sm font-bold text-center hover:bg-slate-50 transition"
          >
            View Details
          </Link>
          <button
            onClick={() => onRequestViewing?.(property.id, property.title)}
            className="bg-[#034d35] hover:bg-[#023b28] text-white py-3 sm:py-3.5 px-4 sm:px-5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Enquire
          </button>
        </div>
      </div>
    </div>
  );
}
