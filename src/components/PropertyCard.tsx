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
    tiktokUrl?: string | null;
    videoUrl?: string | null;
    socialPlatform?: string | null;
    socialUrl?: string | null;
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

  // Social platform styling & configuration for 3rd action button
  const rawPlatform = (property.socialPlatform || '').toUpperCase().trim();
  const matchedSocialKey =
    rawPlatform.includes('INSTA') ? 'INSTAGRAM' :
    rawPlatform.includes('FACE') ? 'FACEBOOK' :
    rawPlatform.includes('YOU') || rawPlatform.includes('YT') ? 'YOUTUBE' :
    'TIKTOK';

  const socialConfig = {
    TIKTOK: {
      label: 'TikTok',
      defaultUrl: 'https://www.tiktok.com/@loveridgeproperty?is_from_webapp=1&sender_device=pc',
      className: 'bg-black hover:bg-neutral-800 text-white shadow-2xs',
      icon: (
        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
        </svg>
      ),
    },
    INSTAGRAM: {
      label: 'Instagram',
      defaultUrl: 'https://www.instagram.com/loveridgepropertiesgh/',
      className: 'bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white shadow-2xs',
      icon: (
        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    FACEBOOK: {
      label: 'Facebook',
      defaultUrl: 'https://web.facebook.com/loveridgepropertiesgh',
      className: 'bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-2xs',
      icon: (
        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    YOUTUBE: {
      label: 'YouTube',
      defaultUrl: 'https://www.youtube.com/@loveridgeproperties',
      className: 'bg-[#FF0000] hover:bg-[#d90000] text-white shadow-2xs',
      icon: (
        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  }[matchedSocialKey];

  const resolvedSocialUrl =
    property.socialUrl ||
    (property as any).tiktokUrl ||
    (property as any).videoUrl ||
    socialConfig.defaultUrl;

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
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== fallbackImg) {
                target.src = fallbackImg;
              }
            }}
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

        {/* Actions - 3 Section Buttons: View Details, Enquire, Social Media (TikTok) */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1.5">
          {/* 1. View Details - Pill with dark crisp outline matching Image 2 */}
          <Link
            href={`/properties/${property.slug}`}
            className="flex items-center justify-center py-2.5 sm:py-3 px-1.5 sm:px-2 rounded-full border-2 border-slate-900 hover:border-black text-slate-900 hover:bg-slate-900 hover:text-white text-[11px] sm:text-xs md:text-sm font-extrabold text-center transition-all duration-200 active:scale-95 shadow-2xs group/btn"
          >
            <span className="truncate">View Details</span>
          </Link>

          {/* 2. Enquire - Pill in brand green */}
          <button
            type="button"
            onClick={() => onRequestViewing?.(property.id, property.title)}
            className="flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 sm:py-3 px-1.5 sm:px-2 rounded-full bg-[#034d35] hover:bg-[#023b28] text-white text-[11px] sm:text-xs md:text-sm font-extrabold text-center transition-all duration-200 active:scale-95 shadow-2xs cursor-pointer"
          >
            <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">Enquire</span>
          </button>

          {/* 3. Social Media Button (TikTok / Instagram / Facebook / YouTube) */}
          <a
            href={resolvedSocialUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 sm:py-3 px-1.5 sm:px-2 rounded-full ${socialConfig.className} text-[11px] sm:text-xs md:text-sm font-extrabold text-center transition-all duration-200 active:scale-95 cursor-pointer`}
            title={`View on ${socialConfig.label}`}
            aria-label={`View on ${socialConfig.label}`}
          >
            {socialConfig.icon}
            <span className="truncate">{socialConfig.label}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
