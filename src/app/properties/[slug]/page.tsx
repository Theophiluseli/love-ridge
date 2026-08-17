'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import InquiryModal from '@/components/InquiryModal';
import { MapPin, Bed, Bath, Maximize2, Shield, Calendar, ChevronLeft, CheckCircle2, Images, X, PhoneCall } from 'lucide-react';
import Link from 'next/link';

const SEED_PROPERTIES: Record<string, any> = {
  'luxury-4-bedroom-smart-villa-east-legon': {
    id: 'prop-1',
    title: 'Luxury 4-Bedroom Smart Villa (East Legon)',
    slug: 'luxury-4-bedroom-smart-villa-east-legon',
    description: 'Ultra-modern 4-bedroom detached smart villa situated in the heart of East Legon. Features automated home systems, private infinity swimming pool, rooftop terrace, fully fitted Italian kitchen with Bosch appliances, solar backup system, and 24/7 security post.',
    price: 450000,
    currency: 'USD',
    pricePeriod: 'outright purchase',
    listingType: 'SALE',
    propertyType: 'HOUSE',
    bedrooms: 4,
    bathrooms: 5,
    sizeSqft: 4500,
    locationAddress: 'Boundary Road, East Legon',
    city: 'Accra',
    region: 'Greater Accra',
    imageUrl: '/property_villa.png',
    galleryUrls: ['/property_villa.png'],
    agent: { name: 'Kwame Appiah', phone: '+233 55 666 7777' },
    amenities: [
      { amenity: { name: 'Private Swimming Pool' } },
      { amenity: { name: 'Smart Home Automation' } },
      { amenity: { name: 'Solar Hybrid Power System' } },
      { amenity: { name: '24/7 Standby Generator' } },
      { amenity: { name: 'Underground Parking' } },
      { amenity: { name: 'Electric Security Fence' } },
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
    listingType: 'RENT',
    propertyType: 'APARTMENT',
    bedrooms: 2,
    bathrooms: 2,
    sizeSqft: 1800,
    locationAddress: 'Airport Residential Area',
    city: 'Accra',
    region: 'Greater Accra',
    imageUrl: '/property_apartment.png',
    galleryUrls: ['/property_apartment.png'],
    agent: { name: 'Kwame Appiah', phone: '+233 55 666 7777' },
    amenities: [
      { amenity: { name: 'Fully Furnished Designer Interior' } },
      { amenity: { name: 'Fully Equipped Fitness Gym' } },
      { amenity: { name: '24/7 Concierge & Security' } },
      { amenity: { name: 'Underground Reserved Parking' } },
      { amenity: { name: 'High-Speed Fiber Internet' } },
      { amenity: { name: 'Rooftop Lounge & Pool' } },
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
    sizeSqft: 52272,
    locationAddress: 'Cantonments Embassy Quarter',
    city: 'Accra',
    region: 'Greater Accra',
    imageUrl: '/property_land.png',
    galleryUrls: ['/property_land.png'],
    agent: { name: 'Kwame Appiah', phone: '+233 55 666 7777' },
    amenities: [
      { amenity: { name: 'Lands Commission Title Certificate' } },
      { amenity: { name: 'Prime Diplomatic Zone' } },
      { amenity: { name: 'Tarred Access Roads & Electricity' } },
      { amenity: { name: 'High Capital Appreciation' } },
    ],
  },
};

export default function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const initialProp = SEED_PROPERTIES[params?.slug];

  const [property, setProperty] = useState<any>(initialProp || null);
  const [similar, setSimilar] = useState<any[]>(
    initialProp ? Object.values(SEED_PROPERTIES).filter((p) => p.slug !== initialProp.slug) : []
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string>(initialProp?.imageUrl || '');

  useEffect(() => {
    async function syncData() {
      if (!params?.slug) return;
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
        }
      } catch (err) {
        console.error('Quiet sync error:', err);
      }
    }
    syncData();
  }, [params?.slug]);

  if (!property) {
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

  // Multi-photo gallery list: STRICTLY take ONLY photos uploaded for this property
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

  // Remove duplicates and ensure NO default fallback images are appended if user uploaded photos
  const galleryImages = Array.from(
    new Set(
      userUploadedList.length > 0 ? userUploadedList : [currentCover].filter(Boolean)
    )
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between bg-grid-pattern">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <Link
          href="/properties"
          className="text-xs text-slate-500 hover:text-emerald-800 font-bold inline-flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Properties
        </Link>

        {/* Gallery / Header Hero Showcase */}
        <div className="relative h-[320px] sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex items-center justify-center p-4 sm:p-8 group bg-slate-900">
          <img
            src={currentCover}
            alt={property.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent z-10" />

          <div className="relative z-20 max-w-3xl text-center space-y-3 sm:space-y-4">
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
          {/* Left Column: Specs, Description, Amenities, Gallery */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Specs Bar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Bedrooms</span>
                <span className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2 mt-1">
                  <Bed className="w-5 h-5 text-emerald-700" /> {property.bedrooms || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium block">Bathrooms</span>
                <span className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2 mt-1">
                  <Bath className="w-5 h-5 text-emerald-700" /> {property.bathrooms || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium block">Property Size</span>
                <span className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2 mt-1">
                  <Maximize2 className="w-5 h-5 text-emerald-700" /> {property.sizeSqft ? `${property.sizeSqft} sqft` : 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium block">Title Verification</span>
                <span className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1 mt-2">
                  <Shield className="w-4 h-4" /> Lands Comm. Verified
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Property Overview</h2>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
                {property.description}
              </p>
            </div>

            {/* Property Photo Gallery Section (Interactive Thumbnail Switcher) */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Property Photo Gallery ({galleryImages.length} Photos)</h2>
                <span className="text-xs text-slate-500 font-medium">Click photo to switch main view</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {galleryImages.map((imgUrl: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setActivePhoto(imgUrl)}
                    className={`relative h-36 rounded-2xl overflow-hidden border-2 cursor-pointer group bg-slate-50 transition-all ${
                      currentCover === imgUrl
                        ? 'border-emerald-800 shadow-md ring-2 ring-emerald-800/20 scale-105'
                        : 'border-slate-200 hover:border-slate-400 opacity-90'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Property Photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 bg-white/95 text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-full transition-opacity shadow-md flex items-center gap-1">
                        <Images className="w-3 h-3" /> View
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Price & Agent Card */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-6 lg:sticky lg:top-24">
              <div>
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">LISTING PRICE</span>
                <div className="flex flex-wrap items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-emerald-950">
                    {property.currency === 'USD' ? '$' : 'GHS '}
                    {property.price?.toLocaleString()}
                  </span>
                  {property.pricePeriod && (
                    <span className="inline-flex items-center text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
                      {property.pricePeriod.toLowerCase() === 'outright purchase' ? 'Outright Purchase' : property.pricePeriod.toLowerCase() === 'per month' ? 'Per Month' : property.pricePeriod}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="gradient-btn w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <Calendar className="w-4 h-4" /> Book Physical Viewing
              </button>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold">ASSIGNED AGENT</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center font-bold text-emerald-900 shrink-0">
                    {(property.contactName || property.agent?.name || 'Kwame Appiah').charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{property.contactName || property.agent?.name || 'Kwame Appiah'}</h5>
                    <p className="text-xs text-slate-500 font-medium">+233 (0) 24 000 1111</p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/233240001111?text=Hello%20${encodeURIComponent(property.contactName || property.agent?.name || 'Agent')},%20I%20am%20interested%20in%20viewing%20${encodeURIComponent(property.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> Chat With Agent on WhatsApp
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
        title="Schedule Property Viewing"
        type="PROPERTY_VIEWING"
        propertyId={property.id}
        itemName={property.title}
      />
    </div>
  );
}
