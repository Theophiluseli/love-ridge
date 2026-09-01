'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import InquiryModal from '@/components/InquiryModal';
import ImageGalleryModal from '@/components/ImageGalleryModal';
import SocialShare from '@/components/SocialShare';
import { useCurrency } from '@/context/CurrencyContext';
import { MapPin, Bed, Bath, Maximize2, Shield, Calendar, ChevronLeft, CheckCircle2, Images, X, PhoneCall, Mail, UserCheck, Home, Clock, BadgeCheck, Tv, Network, Asterisk, Check, Wind, Flame, Shirt, Fan, Wifi, Trees, Car, Sun, Send } from 'lucide-react';
import Link from 'next/link';
import { formatPropertyType } from '@/lib/property-categories';

const SEED_PROPERTIES: Record<string, any> = {
  'luxury-4-bedroom-smart-villa-east-legon': {
    id: 'prop-1',
    title: 'Luxury 4-Bedroom Smart Villa (East Legon)',
    slug: 'luxury-4-bedroom-smart-villa-east-legon',
    description: 'Ultra-modern 4-bedroom detached smart villa situated in the heart of East Legon. Features automated home systems, private infinity swimming pool, rooftop terrace, fully fitted Italian kitchen with Bosch appliances, solar backup system, and 24/7 security post.',
    price: 450000,
    currency: 'USD',
    pricePeriod: 'outright purchase',
    negotiable: true,
    listingType: 'SALE',
    propertyType: 'HOUSE',
    bedrooms: 4,
    bathrooms: 5,
    guestRooms: 1,
    sizeSqft: 4500,
    livingAreaSqft: 3800,
    locationAddress: 'Boundary Road, East Legon',
    city: 'Accra',
    region: 'Greater Accra',
    imageUrl: '/property_villa.png',
    galleryUrls: ['/property_villa.png', '/hero_carousel_1.jpg', '/hero_carousel_2.jpg'],
    agent: { name: 'Kwame Appiah', email: 'k.appiah@loveridgeproperty.com', phone: '+233 55 666 7777', title: 'Senior Real Estate Consultant' },
    updatedAt: new Date().toISOString(),
    amenities: [
      'Air conditioning',
      'Cooker',
      'Washing machine',
      'Fans',
      'Refrigerator',
      'Microwave',
      'Internet access',
      'Satellite tv',
      'Garden',
      'Garage',
      "Annexe (Boys' quarters)",
      'Roof terrace',
      'Private Swimming Pool',
      'Smart Home Automation',
      'Solar Hybrid Power System',
      '24/7 Standby Generator',
    ],
  },
  'executive-2-bedroom-serviced-apartment-airport-residential': {
    id: 'prop-2',
    title: 'Executive 2-Bedroom Serviced Apartment (Airport Residential)',
    slug: 'executive-2-bedroom-serviced-apartment-airport-residential',
    description: 'Modern high-rise residential apartment unit offering panoramic views of Airport Residential Area. Comes fully furnished with designer Italian furniture, gym access, standby generator, underground parking, and concierge service.',
    price: 3200,
    currency: 'USD',
    pricePeriod: 'per month',
    negotiable: true,
    listingType: 'RENT',
    propertyType: 'APARTMENT',
    bedrooms: 2,
    bathrooms: 2,
    guestRooms: 0,
    sizeSqft: 1800,
    livingAreaSqft: 1500,
    locationAddress: 'Airport Residential Area',
    city: 'Accra',
    region: 'Greater Accra',
    imageUrl: '/property_apartment.png',
    galleryUrls: ['/property_apartment.png', '/hero_carousel_3.jpg'],
    agent: { name: 'Sandra Mensah', email: 's.mensah@loveridgeproperty.com', phone: '+233 24 111 2222', title: 'Commercial Property Specialist' },
    updatedAt: new Date().toISOString(),
    amenities: [
      'Air conditioning',
      'Cooker',
      'Washing machine',
      'Fans',
      'Refrigerator',
      'Microwave',
      'Internet access',
      'Satellite tv',
      'Fully Furnished Designer Interior',
      'Fully Equipped Fitness Gym',
      '24/7 Concierge & Security',
      'Rooftop Lounge & Pool',
    ],
  },
  'prime-commercial-land-cantonments-embassy-quarter': {
    id: 'prop-3',
    title: 'Prime Commercial Land (1.2 Acres) - Cantonments',
    slug: 'prime-commercial-land-cantonments-embassy-quarter',
    description: 'Rare development opportunity! 1.2 acres of prime commercial/residential land located in the diplomatic zone of Cantonments. Fully registered title with Lands Commission clearance. Ideal for embassy headquarters, high-rise luxury apartments, or corporate office complex.',
    price: 1800000,
    currency: 'USD',
    pricePeriod: 'outright purchase',
    listingType: 'SALE',
    propertyType: 'LAND',
    bedrooms: 0,
    bathrooms: 0,
    guestRooms: 0,
    sizeSqft: 52272,
    livingAreaSqft: 0,
    locationAddress: 'Cantonments Embassy Quarter',
    city: 'Accra',
    region: 'Greater Accra',
    imageUrl: '/property_land.png',
    galleryUrls: ['/property_land.png'],
    agent: { name: 'Kwame Appiah', email: 'k.appiah@loveridgeproperty.com', phone: '+233 55 666 7777', title: 'Senior Real Estate Consultant' },
    updatedAt: new Date().toISOString(),
    amenities: [
      { amenity: { name: 'Lands Commission Title Certificate' } },
      { amenity: { name: 'Prime Diplomatic Zone' } },
      { amenity: { name: 'Tarred Access Roads & Electricity' } },
      { amenity: { name: 'High Capital Appreciation' } },
    ],
  },
};

export default function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const seedMatch = SEED_PROPERTIES[params?.slug] || Object.values(SEED_PROPERTIES).find((p) => p.id === params?.slug);
  const { formatPrice } = useCurrency();

  const [property, setProperty] = useState<any>(seedMatch || null);
  const [similar, setSimilar] = useState<any[]>(
    seedMatch ? Object.values(SEED_PROPERTIES).filter((p) => p.slug !== seedMatch.slug) : []
  );
  const [loading, setLoading] = useState<boolean>(!seedMatch);

  const [modalOpen, setModalOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState('General Consultancy');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string>(seedMatch?.imageUrl || '');
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    async function syncData() {
      if (!params?.slug) {
        setLoading(false);
        return;
      }

      // 1. Instant optimistic lookup from local browser cache
      try {
        const stored = localStorage.getItem('loveridge_properties_override');
        if (stored) {
          const list = JSON.parse(stored);
          const localMatch = list.find(
            (p: any) =>
              (p.slug && p.slug.toLowerCase() === params.slug.toLowerCase()) ||
              (p.id && p.id.toLowerCase() === params.slug.toLowerCase())
          );
          if (localMatch) {
            setProperty(localMatch);
            if (localMatch.imageUrl) setActivePhoto(localMatch.imageUrl);
            setLoading(false);
          }
        }
      } catch (e) {}

      // 2. Fetch fresh data from API
      try {
        const res = await fetch(`/api/properties/${params.slug}`);
        const data = await res.json();
        if (data && data.property) {
          setProperty(data.property);
          if (data.similar && data.similar.length > 0) {
            setSimilar(data.similar);
          }
          if (data.property.imageUrl) {
            setActivePhoto(data.property.imageUrl);
          }
        } else {
          // If DB didn't find it, fallback to seed properties by slug or ID
          const fallback = Object.values(SEED_PROPERTIES).find(
            (p) => p.slug === params.slug || p.id === params.slug
          );
          if (fallback) {
            setProperty(fallback);
            if (fallback.imageUrl) setActivePhoto(fallback.imageUrl);
          }
        }
      } catch (err) {
        console.error('Property detail sync error:', err);
        const fallback = Object.values(SEED_PROPERTIES).find(
          (p) => p.slug === params.slug || p.id === params.slug
        );
        if (fallback) {
          setProperty(fallback);
          if (fallback.imageUrl) setActivePhoto(fallback.imageUrl);
        }
      } finally {
        setLoading(false);
      }
    }
    syncData();
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-800 rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Loading Property Details...</h2>
        </main>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-800 font-bold text-2xl shadow-sm">
            🏡
          </div>
          <h2 className="text-3xl font-black text-slate-900">Property Listing Not Found</h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto font-medium leading-relaxed">
            The property listing you are trying to view might have been moved, unpublished, or is currently unavailable.
          </p>
          <div>
            <Link
              href="/properties"
              className="gradient-btn px-6 py-3.5 rounded-2xl text-xs font-bold inline-flex items-center gap-2 shadow-md"
            >
              ← Browse All Verified Property Listings
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Determine cover image: strictly use uploaded imageUrl first
  let defaultCover = property.imageUrl;
  if (!defaultCover) {
    if (property.propertyType === 'OFFICE_SPACE' || property.slug?.includes('office')) {
      defaultCover = '/property_office.png';
    } else if (property.propertyType === 'WAREHOUSE' || property.slug?.includes('warehouse')) {
      defaultCover = '/property_warehouse.png';
    } else if (property.propertyType === 'LAND' || property.slug?.includes('land')) {
      defaultCover = '/property_land.png';
    } else if (property.propertyType === 'APARTMENT' || property.slug?.includes('apartment')) {
      defaultCover = '/property_apartment.png';
    } else {
      defaultCover = '/property_villa.png';
    }
  }

  const currentCover = activePhoto || defaultCover;

  // Multi-photo gallery list
  const uploadedGallery = Array.isArray(property.galleryUrls) ? property.galleryUrls : [];
  const uploadedMedia = Array.isArray(property.media)
    ? property.media.map((m: any) => m.media?.fileUrl).filter(Boolean)
    : [];
  const uploadedImages = Array.isArray(property.images) ? property.images : [];

  const userUploadedList = [
    property.imageUrl,
    ...uploadedGallery,
    ...uploadedMedia,
    ...uploadedImages,
  ].filter(Boolean);

  const galleryImages = Array.from(
    new Set(
      userUploadedList.length > 0 ? userUploadedList : [currentCover].filter(Boolean)
    )
  );

  const formattedPrice = formatPrice(property.price, property.currency || 'GHS');
  const agentName = property.contactName || property.agent?.name || 'Kwame Appiah';
  const agentPhone = property.contactPhone || property.agent?.phone || '0246432493';
  const agentEmail = property.contactEmail || property.agent?.email || 'sales@loveridgeproperty.com';
  const agentTitle = property.agent?.title || 'Lead Real Estate Broker';

  const updatedDate = property.updatedAt || property.createdAt;
  const formattedUpdateDate = updatedDate
    ? new Date(updatedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Recently Updated';

  // Normalize and group amenities (House & Apartment general amenities)
  const rawAmenities = property.amenities || [];
  const normalizedAmenities: string[] = Array.isArray(rawAmenities)
    ? rawAmenities
        .map((a: any) => (typeof a === 'string' ? a : a.amenity?.name || a.name || ''))
        .filter(Boolean)
    : [];

  const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const applianceAmenities = normalizedAmenities.filter((a) =>
    ['air conditioning', 'cooker', 'washing machine', 'fans', 'refrigerator', 'microwave'].some(
      (target) => norm(a) === norm(target)
    )
  );

  const connectivityAmenities = normalizedAmenities.filter((a) =>
    ['internet access', 'satellite tv'].some((target) => norm(a) === norm(target))
  );

  const otherAmenities = normalizedAmenities.filter((a) =>
    ['garden', 'garage', "annexe (boys' quarters)", 'roof terrace'].some((target) => norm(a) === norm(target))
  );

  const generalAmenityNorms = new Set([
    'airconditioning',
    'cooker',
    'washingmachine',
    'fans',
    'fan',
    'refrigerator',
    'microwave',
    'internetaccess',
    'satellitetv',
    'garden',
    'garage',
    'annexeboysquarters',
    'roofterrace',
  ]);

  const customHighlights = normalizedAmenities.filter((a) => !generalAmenityNorms.has(norm(a)));
  const hasAnyAmenities = normalizedAmenities.length > 0;

  function getAmenityIcon(name: string) {
    const lower = name.toLowerCase();
    if (lower.includes('air conditioning')) return <Wind className="w-4 h-4 text-sky-600" />;
    if (lower.includes('cooker')) return <Flame className="w-4 h-4 text-orange-600" />;
    if (lower.includes('washing machine')) return <Shirt className="w-4 h-4 text-indigo-600" />;
    if (lower.includes('fan')) return <Fan className="w-4 h-4 text-teal-600" />;
    if (lower.includes('refrigerator')) return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
    if (lower.includes('microwave')) return <Flame className="w-4 h-4 text-amber-600" />;
    if (lower.includes('internet')) return <Wifi className="w-4 h-4 text-purple-600" />;
    if (lower.includes('satellite') || lower.includes('tv')) return <Tv className="w-4 h-4 text-fuchsia-600" />;
    if (lower.includes('garden')) return <Trees className="w-4 h-4 text-emerald-600" />;
    if (lower.includes('garage')) return <Car className="w-4 h-4 text-blue-600" />;
    if (lower.includes('annexe') || lower.includes('boys')) return <Home className="w-4 h-4 text-rose-600" />;
    if (lower.includes('terrace') || lower.includes('roof')) return <Sun className="w-4 h-4 text-amber-600" />;
    return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between bg-grid-pattern">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="flex items-center justify-between">
          <Link
            href="/properties"
            className="text-xs text-slate-500 hover:text-emerald-800 font-bold inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Properties
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Last Updated: {formattedUpdateDate}</span>
          </div>
        </div>

        {/* Gallery / Header Hero Showcase */}
        <div className="relative h-[320px] sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex items-center justify-center p-4 sm:p-8 group bg-slate-900">
          <img
            src={currentCover}
            alt={property.title}
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer"
            onClick={() => {
              setLightboxIndex(galleryImages.indexOf(currentCover) >= 0 ? galleryImages.indexOf(currentCover) : 0);
              setLightboxOpen(true);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent z-10 pointer-events-none" />

          <button
            onClick={() => {
              setLightboxIndex(galleryImages.indexOf(currentCover) >= 0 ? galleryImages.indexOf(currentCover) : 0);
              setLightboxOpen(true);
            }}
            className="absolute top-4 right-4 z-20 bg-white/95 text-slate-900 hover:bg-emerald-800 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg"
          >
            <Images className="w-4 h-4" /> View Full Gallery ({galleryImages.length})
          </button>

          <div className="relative z-20 max-w-3xl text-center space-y-3 sm:space-y-4 pointer-events-none">
            <div className="flex items-center justify-center gap-2">
              <span className="px-3.5 py-1 bg-emerald-800 text-white text-[10px] sm:text-xs font-bold uppercase rounded-full shadow-sm">
                FOR {property.propertyType === 'LAND' ? 'SALE' : property.listingType}
              </span>
              <span className="px-3.5 py-1 bg-white/95 text-slate-900 text-[10px] sm:text-xs font-bold rounded-full shadow-sm">
                {property.propertyType}
              </span>
            </div>

            <h1 className="text-xl sm:text-5xl font-black text-white leading-tight drop-shadow-md">
              {property.title}
            </h1>

            <div className="flex items-center justify-center gap-1.5 text-emerald-200 text-xs sm:text-sm font-semibold">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{property.locationAddress}, {property.city}, {property.region || 'Ghana'}</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Details + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Specs, Description, Gallery, Amenities */}
          <div className="lg:col-span-2 space-y-8">
            {/* Comprehensive Quick Specs Bar (Matching exact user screenshot design: Beds, Baths, Guest, BQ, Garage, sqft) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
              <div className="flex flex-col items-center">
                <span className="text-[11px] text-slate-500 font-medium block">Bedrooms</span>
                <span className="text-sm sm:text-base font-black text-slate-900 flex items-center justify-center gap-1.5 mt-1">
                  <Bed className="w-4 h-4 text-emerald-800" /> {property.bedrooms ?? 0} Beds
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[11px] text-slate-500 font-medium block">Bathrooms</span>
                <span className="text-sm sm:text-base font-black text-slate-900 flex items-center justify-center gap-1.5 mt-1">
                  <Bath className="w-4 h-4 text-emerald-800" /> {property.bathrooms ?? 0} Baths
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[11px] text-slate-500 font-medium block">Guest Rooms</span>
                <span className="text-sm sm:text-base font-black text-slate-900 flex items-center justify-center gap-1.5 mt-1">
                  <Home className="w-4 h-4 text-emerald-800" /> {property.guestRooms ?? 0} Guest
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[11px] text-slate-500 font-medium block">Boys Quarters</span>
                <span className="text-sm sm:text-base font-black text-slate-900 flex items-center justify-center gap-1.5 mt-1">
                  <UserCheck className="w-4 h-4 text-emerald-800" /> {property.boysQuarters ?? 0} BQ
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[11px] text-slate-500 font-medium block">Garage</span>
                <span className="text-sm sm:text-base font-black text-slate-900 flex items-center justify-center gap-1.5 mt-1">
                  <Shield className="w-4 h-4 text-emerald-800" /> {property.garage ?? 0} Garage
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[11px] text-slate-500 font-medium block">Area Size</span>
                <span className="text-sm sm:text-base font-black text-slate-900 flex items-center justify-center gap-1.5 mt-1">
                  <Maximize2 className="w-4 h-4 text-emerald-800" /> {property.livingAreaSqft || property.sizeSqft || 0} sqft
                </span>
              </div>
            </div>

            {/* Detailed House Specifications Grid */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Property Overview & Specifications</h2>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-900 text-xs font-bold rounded-full border border-emerald-200">
                  Verified Property Details
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Property Type</span>
                  <span className="text-slate-900 font-bold block">{formatPropertyType(property.propertyType)}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Listing Type</span>
                  <span className="text-slate-900 font-bold block">FOR {property.listingType}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Boys Quarters (BQ)</span>
                  <span className="text-emerald-800 font-bold block">
                    {property.boysQuarters ?? 0} Room(s)
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Garage & Carport</span>
                  <span className="text-slate-900 font-bold block">
                    {property.garage ?? 0} Vehicle Space(s)
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Interior Living Space</span>
                  <span className="text-slate-900 font-bold block">{property.livingAreaSqft || property.sizeSqft || 0} sqft</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Land Documentation</span>
                  <span className="text-emerald-800 font-bold block flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" /> Titled & Indenture Checked
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Price Terms</span>
                  <span className="text-slate-900 font-bold block flex items-center gap-1.5">
                    {property.negotiable ? (
                      <span className="text-blue-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3] text-blue-600" /> Negotiable
                      </span>
                    ) : (
                      'Fixed Price'
                    )}
                  </span>
                </div>
              </div>

              {/* Description Body */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-slate-900">Description</h3>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {property.description}
                </p>
              </div>
            </div>

            {/* GENERAL AMENITIES SECTION */}
            {hasAnyAmenities && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                {/* Header matching user design */}
                <div className="space-y-3">
                  <div className="h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 rounded-full w-full" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <BadgeCheck className="w-6 h-6 text-emerald-800" />
                        General Amenities
                      </h2>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Verified appliances, connectivity, and property amenities included with this listing.
                      </p>
                    </div>
                    <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-900 text-xs font-black rounded-full border border-emerald-200/80 self-start sm:self-auto shadow-2xs">
                      {normalizedAmenities.length} Inclusions Verified
                    </span>
                  </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Appliances */}
                  {applianceAmenities.length > 0 && (
                    <div className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
                      <div className="flex items-center gap-2.5 border-b border-slate-200/80 pb-3">
                        <div className="w-8 h-8 rounded-xl bg-fuchsia-100 flex items-center justify-center text-fuchsia-700">
                          <Tv className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-slate-900">Appliances</h4>
                          <span className="text-[11px] text-slate-500 font-medium">{applianceAmenities.length} installed</span>
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        {applianceAmenities.map((name) => (
                          <div key={name} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs">
                            <div className="flex items-center gap-2.5">
                              {getAmenityIcon(name)}
                              <span className="text-xs font-bold text-slate-800">{name}</span>
                            </div>
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Connectivity */}
                  {connectivityAmenities.length > 0 && (
                    <div className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
                      <div className="flex items-center gap-2.5 border-b border-slate-200/80 pb-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                          <Network className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-slate-900">Connectivity</h4>
                          <span className="text-[11px] text-slate-500 font-medium">{connectivityAmenities.length} active</span>
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        {connectivityAmenities.map((name) => (
                          <div key={name} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs">
                            <div className="flex items-center gap-2.5">
                              {getAmenityIcon(name)}
                              <span className="text-xs font-bold text-slate-800">{name}</span>
                            </div>
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Inclusions */}
                  {otherAmenities.length > 0 && (
                    <div className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
                      <div className="flex items-center gap-2.5 border-b border-slate-200/80 pb-3">
                        <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center text-pink-700">
                          <Asterisk className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-slate-900">Other Features</h4>
                          <span className="text-[11px] text-slate-500 font-medium">{otherAmenities.length} on-site</span>
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        {otherAmenities.map((name) => (
                          <div key={name} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs">
                            <div className="flex items-center gap-2.5">
                              {getAmenityIcon(name)}
                              <span className="text-xs font-bold text-slate-800">{name}</span>
                            </div>
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Highlights (if any other amenities exist) */}
                {customHighlights.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-3">
                      Additional Property Highlights
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {customHighlights.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 text-xs font-bold shadow-2xs"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Property Photo Gallery Section */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Property Photo Gallery ({galleryImages.length} Photos)</h2>
                <span className="text-xs text-slate-500 font-medium">Click photo to open lightbox viewer</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {galleryImages.map((imgUrl: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActivePhoto(imgUrl);
                      setLightboxIndex(idx);
                      setLightboxOpen(true);
                    }}
                    className={`relative h-36 rounded-2xl overflow-hidden border-2 cursor-pointer group bg-slate-50 transition-all ${
                      currentCover === imgUrl
                        ? 'border-emerald-800 shadow-md ring-2 ring-emerald-800/20 scale-105'
                        : 'border-slate-200 hover:border-slate-400 opacity-90'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Property Photo ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 bg-white/95 text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-full transition-opacity shadow-md flex items-center gap-1">
                        <Images className="w-3 h-3 text-emerald-800" /> Open Lightbox
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Share Widget */}
            <SocialShare
              title={property.title}
              summary={`Check out ${property.title} in ${property.city} listed on Loveridge Properties.`}
            />
          </div>

          {/* Right Column: Price & Agent Card */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-6 lg:sticky lg:top-24">
              <div>
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">LISTING PRICE</span>
                <div className="flex flex-wrap items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-emerald-950">
                    {formattedPrice}
                  </span>
                  {property.pricePeriod && (
                    <span className="inline-flex items-center text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
                      {property.pricePeriod.toLowerCase() === 'outright purchase' ? 'Outright Purchase' : property.pricePeriod.toLowerCase() === 'per month' ? 'Per Month' : property.pricePeriod}
                    </span>
                  )}
                  {property.negotiable && (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3] text-blue-600" /> Negotiable
                    </span>
                  )}
                </div>
              </div>

              {/* ENQUIRY & VIEWING BUTTONS */}
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    setInquiryType('General Consultancy');
                    setModalOpen(true);
                  }}
                  className="w-full bg-[#034d35] hover:bg-[#023b28] text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Make an Enquiry
                </button>

                <button
                  onClick={() => {
                    setInquiryType('Property Viewing Request');
                    setModalOpen(true);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-emerald-800" /> Book Physical Viewing
                </button>
              </div>

              {/* Full Official Loveridge Contact Details Card */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold">OFFICIAL PROPERTY BROKERAGE</h4>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <UserCheck className="w-3 h-3 text-emerald-700" /> Loveridge Verified
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-white font-black text-base flex items-center justify-center border border-emerald-700 shadow-md shrink-0">
                    L
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-900">Loveridge Properties & Consult</h5>
                    <p className="text-xs text-emerald-800 font-bold">Senior Real Estate Advisory Desk</p>
                    <p className="text-xs text-slate-500 font-medium">+233 24 643 2493</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-semibold text-slate-700">
                  <a
                    href="tel:+233246432493"
                    className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                  >
                    <PhoneCall className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Call Direct: +233 24 643 2493</span>
                  </a>

                  <a
                    href={`mailto:sales@loveridgeproperty.com?subject=Inquiry%20Regarding%20${encodeURIComponent(property.title)}`}
                    className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition truncate"
                  >
                    <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="truncate">sales@loveridgeproperty.com</span>
                  </a>
                </div>

                <a
                  href={`https://wa.me/233246432493?text=Hello%20Loveridge%20Properties,%20I%20am%20interested%20in%20viewing%20${encodeURIComponent(property.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> Chat With Loveridge Desk on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similar.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Similar Listed Properties
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map((sim) => (
                <PropertyCard key={sim.id} property={sim} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />

      <InquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Property Enquiry"
        defaultInquiryType={inquiryType}
        type="PROPERTY_VIEWING"
        propertyId={property.id}
        itemName={property.title}
      />

      <ImageGalleryModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={galleryImages}
        initialIndex={lightboxIndex}
        title={property.title}
      />
    </div>
  );
}
