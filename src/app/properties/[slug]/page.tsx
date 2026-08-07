'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import InquiryModal from '@/components/InquiryModal';
import { MapPin, Bed, Bath, Maximize2, Shield, Calendar, ChevronLeft, CheckCircle2, Images, X } from 'lucide-react';
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
    images: ['/property_villa.png', '/property_apartment.png', '/property_land.png'],
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
    images: ['/property_apartment.png', '/property_villa.png', '/property_land.png'],
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
    images: ['/property_land.png', '/property_villa.png', '/property_apartment.png'],
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
  const initialProp = SEED_PROPERTIES[params?.slug] || SEED_PROPERTIES['executive-2-bedroom-serviced-apartment-airport-residential'];

  const [property, setProperty] = useState<any>(initialProp);
  const [similar, setSimilar] = useState<any[]>(Object.values(SEED_PROPERTIES).filter((p) => p.slug !== initialProp.slug));
  const [modalOpen, setModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string>('');

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
        }
      } catch (err) {
        console.error('Quiet sync error:', err);
      }
    }
    syncData();
  }, [params?.slug]);

  // Determine cover image
  let heroImage = property.imageUrl;
  if (!heroImage) {
    if (property.slug?.includes('apartment') || property.propertyType === 'APARTMENT') {
      heroImage = '/property_apartment.png';
    } else if (property.slug?.includes('land') || property.propertyType === 'LAND') {
      heroImage = '/property_land.png';
    } else {
      heroImage = '/property_villa.png';
    }
  }

  const galleryImages = property.images && property.images.length > 0
    ? property.images
    : ['/property_apartment.png', '/property_villa.png', '/property_land.png'];

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
        <div className="relative h-[300px] sm:h-[440px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex items-center justify-center p-4 sm:p-8 group">
          <img
            src={heroImage}
            alt={property.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent z-10" />

          <div className="relative z-20 max-w-3xl text-center space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="px-3 py-1 bg-emerald-800 text-white text-[10px] sm:text-xs font-bold uppercase rounded-full shadow-sm">
                FOR {property.listingType}
              </span>
              <span className="px-3 py-1 bg-white/90 text-slate-900 text-[10px] sm:text-xs font-bold rounded-full shadow-sm">
                {property.propertyType}
              </span>
            </div>

            <h1 className="text-xl sm:text-5xl font-black text-white leading-tight drop-shadow-md">
              {property.title}
            </h1>

            <div className="flex items-center justify-center gap-1.5 text-emerald-200 text-xs sm:text-sm font-semibold">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{property.locationAddress}, {property.city}, {property.region}</span>
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
                  <Maximize2 className="w-5 h-5 text-emerald-700" /> {property.sizeSqft || 'N/A'} <span className="text-xs font-normal">sqft</span>
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

            {/* Features & Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Features & Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.amenities.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-slate-800 text-sm font-semibold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                      <span>{item.amenity?.name || item.name || item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Property Photo Gallery Section (Positioned under Features) */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Property Photo Gallery</h2>
                <span className="text-xs text-slate-500 font-medium">Click photo to expand</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {galleryImages.map((imgUrl: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedGalleryImage(imgUrl);
                      setLightboxOpen(true);
                    }}
                    className="relative h-44 rounded-xl overflow-hidden border border-slate-200 cursor-pointer group bg-slate-50"
                  >
                    <img
                      src={imgUrl}
                      alt={`Property Photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 bg-white/95 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full transition-opacity shadow-md flex items-center gap-1.5">
                        <Images className="w-3.5 h-3.5" /> Expand
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Price & Agent Card */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl space-y-6 lg:sticky lg:top-24">
              <div>
                <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">LISTING PRICE</span>
                <div className="text-3xl font-black text-emerald-900 mt-1">
                  {property.currency === 'USD' ? '$' : 'GHS '}
                  {property.price?.toLocaleString()}
                  {property.pricePeriod && (
                    <span className="text-xs text-slate-500 font-medium ml-1">{property.pricePeriod}</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="gradient-btn w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" /> Schedule Physical Viewing
              </button>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold">ASSIGNED AGENT</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center font-bold text-emerald-900">
                    {property.agent?.name?.charAt(0) || 'K'}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{property.agent?.name || 'Kwame Appiah'}</h5>
                    <p className="text-xs text-slate-500 font-medium">{property.agent?.phone || '+233 55 666 7777'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Listings */}
        {similar.length > 0 && (
          <div className="space-y-6 pt-10 border-t border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900">Similar Properties</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similar.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
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

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8">
          <div className="flex items-center justify-between text-white max-w-6xl mx-auto w-full">
            <div className="text-sm font-bold">{property.title} - Photo Gallery</div>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="max-w-4xl mx-auto w-full h-[60vh] sm:h-[70vh] flex items-center justify-center p-4">
            <img
              src={selectedGalleryImage || heroImage}
              alt="Gallery Full View"
              className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
            />
          </div>

          {/* Lightbox Bottom Thumbnails */}
          <div className="flex items-center justify-center gap-3 overflow-x-auto py-2 no-scrollbar max-w-xl mx-auto">
            {galleryImages.map((imgUrl: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedGalleryImage(imgUrl)}
                className={`w-16 h-12 rounded-xl overflow-hidden border shrink-0 transition-all ${
                  selectedGalleryImage === imgUrl ? 'border-2 border-emerald-400 scale-110 shadow-lg' : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
