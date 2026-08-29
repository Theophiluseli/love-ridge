'use client';

import Link from 'next/link';
import { Bed, Bath, Maximize2, MapPin, Building, Warehouse as WarehouseIcon, Trees, Clock, Home, Check, Send } from 'lucide-react';
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

  // Determine property picture
  let imgSrc = property.imageUrl;
  if (!imgSrc) {
    if (propType === 'OFFICE_SPACE' || propType === 'OFFICE' || property.slug?.includes('office')) {
      imgSrc = '/property_office.png';
    } else if (propType === 'WAREHOUSE' || property.slug?.includes('warehouse')) {
      imgSrc = '/property_warehouse.png';
    } else if (propType === 'LAND' || property.slug?.includes('land')) {
      imgSrc = '/property_land.png';
    } else if (property.slug?.includes('apartment') || propType === 'APARTMENT') {
      imgSrc = '/property_apartment.png';
    } else {
      imgSrc = '/property_villa.png';
    }
  }

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
    <div className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between group h-full border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Property Cover Image */}
      <div className="relative h-48 sm:h-64 bg-slate-100 overflow-hidden">
        <img
          src={imgSrc}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent z-10" />

        {/* Status Badges */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex gap-2">
          <span
            className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-sm ${
              propType === 'LAND' || !isRent ? 'bg-emerald-600 text-white' : 'bg-emerald-800 text-white'
            }`}
          >
            FOR {propType === 'LAND' ? 'SALE' : property.listingType}
          </span>
          {property.featured && (
            <span className="bg-red-600 text-white px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md">
              FEATURED
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20 flex flex-wrap items-end justify-between gap-2">
          <div className="flex flex-col min-w-0 max-w-full">
            <div className="flex items-baseline flex-wrap gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                {formattedPrice}
              </span>
              {property.pricePeriod && (
                <span className="inline-flex items-center text-[10px] sm:text-xs font-bold text-emerald-300 bg-slate-950/85 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-emerald-500/40 whitespace-nowrap shadow-sm">
                  {formatPeriod(property.pricePeriod)}
                </span>
              )}
              {property.negotiable && (
                <span className="inline-flex items-center text-[10px] sm:text-xs font-bold text-blue-200 bg-blue-950/85 backdrop-blur-md px-2 py-0.5 rounded-md border border-blue-500/40 whitespace-nowrap shadow-sm gap-1">
                  <Check className="w-3 h-3 stroke-[3] text-blue-400" /> Negotiable
                </span>
              )}
            </div>
          </div>
          {!hidePropertyType && (
            <span className="text-[10px] sm:text-xs font-bold text-slate-900 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-md shrink-0">
              {formattedTypeLabel}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
        <div>
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs mb-1.5 font-medium">
            <div className="flex items-center gap-1 min-w-0 pr-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="truncate">{property.locationAddress}, {property.city}</span>
            </div>
            {timeAgo && (
              <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> {timeAgo}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
            {property.title}
          </h3>

          <p className="text-slate-600 text-xs line-clamp-2 mt-1.5 leading-relaxed font-normal">
            {property.description}
          </p>
        </div>

        {/* Specs Grid matching exact user screenshot design */}
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-1 py-2 sm:py-3 border-y border-slate-100 text-[10px] sm:text-xs text-slate-700 font-semibold text-center">
          {propType === 'LAND' ? (
            <>
              <div className="flex flex-col items-center">
                <Trees className="w-3.5 h-3.5 text-emerald-700 mb-0.5" />
                <span>Land</span>
              </div>
              <div className="flex flex-col items-center">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 mb-0.5" />
                <span>Titled</span>
              </div>
              <div className="col-span-2 flex flex-col items-center">
                <Maximize2 className="w-3.5 h-3.5 text-emerald-700 mb-0.5" />
                <span>{property.sizeSqft ? `${(property.sizeSqft / 43560).toFixed(1)} Acres` : 'Land Plot'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center" title="Bedrooms">
                <Bed className="w-3.5 h-3.5 text-emerald-700 mb-0.5" />
                <span>{property.bedrooms || 0} Beds</span>
              </div>
              <div className="flex flex-col items-center" title="Bathrooms">
                <Bath className="w-3.5 h-3.5 text-emerald-700 mb-0.5" />
                <span>{property.bathrooms || 0} Baths</span>
              </div>
              <div className="flex flex-col items-center" title="Guest Rooms">
                <Home className="w-3.5 h-3.5 text-emerald-700 mb-0.5" />
                <span>{property.guestRooms || 0} Guest</span>
              </div>
              <div className="flex flex-col items-center" title="Total Size Sqft">
                <Maximize2 className="w-3.5 h-3.5 text-emerald-700 mb-0.5" />
                <span>{property.livingAreaSqft || property.sizeSqft || 100} sqft</span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/properties/${property.slug}`}
            className="flex-1 py-2 sm:py-2.5 px-3 rounded-xl border border-slate-300 hover:border-emerald-700 text-slate-700 text-xs font-bold text-center hover:bg-slate-50 transition"
          >
            View Details
          </Link>
          <button
            onClick={() => onRequestViewing?.(property.id, property.title)}
            className="bg-[#034d35] hover:bg-[#023b28] text-white py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Send className="w-3 h-3" /> Enquire
          </button>
        </div>
      </div>
    </div>
  );
}
