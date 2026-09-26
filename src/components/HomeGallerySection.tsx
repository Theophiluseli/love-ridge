'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

interface GalleryItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  category: string;
  location?: string | null;
  eventDate?: string | null;
  featured: boolean;
  sortOrder: number;
}

const DEFAULT_HOME_GALLERY: GalleryItem[] = [
  {
    id: 'gallery-kl-expo-01',
    title: 'Kuala Lumpur International Investment Expo',
    description: 'Loveridge consulting team engaging global property investors and cross-border partners at the Kuala Lumpur Aijabei Pavilion.',
    imageUrl: '/gallery/kl-expo-consultation.jpg',
    category: 'Trade Exhibitions',
    location: 'Kuala Lumpur, Malaysia',
    eventDate: 'April 2025',
    featured: true,
    sortOrder: 1,
  },
  {
    id: 'gallery-canton-fair-02',
    title: '137th Canton Fair Materials & Edge Banding Sourcing',
    description: 'Direct factory inspection of premium ABS/PVC edge banding, architectural profiles, and precision hardware for building projects.',
    imageUrl: '/gallery/canton-fair-materials.jpg',
    category: 'Material Sourcing',
    location: 'Guangzhou, China',
    eventDate: 'May 2025',
    featured: true,
    sortOrder: 2,
  },
  {
    id: 'gallery-global-partnership-03',
    title: 'Cross-Border Portfolio Consultation & Due Diligence',
    description: 'Executive strategy sessions guiding clients on global residency, luxury property acquisitions, and foreign exchange hedging.',
    imageUrl: '/gallery/global-partnership-meeting.jpg',
    category: 'Client Advisory',
    location: 'Hong Kong Financial District',
    eventDate: 'June 2025',
    featured: true,
    sortOrder: 3,
  },
  {
    id: 'gallery-client-advisory-04',
    title: 'Executive Client Contract Review & Advisory',
    description: 'In-depth contract review, deed verification, and real estate investment structuring for prospective homeowners and corporate partners.',
    imageUrl: '/gallery/client-document-advisory.jpg',
    category: 'Client Advisory',
    location: 'Loveridge Executive Suite',
    eventDate: 'July 2025',
    featured: true,
    sortOrder: 4,
  },
  {
    id: 'gallery-hardware-samples-05',
    title: 'Architectural Profiles & Color Swatches Inspection',
    description: 'Rigorous quality control and custom finish selections for luxury residential and commercial developments in Ghana.',
    imageUrl: '/gallery/hardware-samples-inspection.jpg',
    category: 'Material Sourcing',
    location: 'Guangzhou International Trade Center',
    eventDate: 'August 2025',
    featured: true,
    sortOrder: 5,
  },
  {
    id: 'gallery-trade-hub-06',
    title: 'Loveridge Global Trade Consultation Hub',
    description: 'High-level delegation meetings exploring supply chain logistics, direct factory bulk purchases, and turn-key development packages.',
    imageUrl: '/gallery/executive-consultation-session.jpg',
    category: 'Trade Exhibitions',
    location: 'Global Trade Center',
    eventDate: 'September 2025',
    featured: true,
    sortOrder: 6,
  },
];

export default function HomeGallerySection() {
  const [items, setItems] = useState<GalleryItem[]>(DEFAULT_HOME_GALLERY);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/gallery', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load gallery');
      const data = await res.json();
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        setItems(data.items);
      }
    } catch (e) {
      console.warn('Quiet notice: using local gallery fallback:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Real-time catalog sync
  useRealtimeSync((type) => {
    if (type === 'gallery') {
      fetchItems();
    }
  });

  // Display top 6 photos on homepage
  const displayedItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
    return sorted.slice(0, 6);
  }, [items]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! + 1) % displayedItems.length);
  }, [lightboxIndex, displayedItems.length]);

  const showPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! - 1 + displayedItems.length) % displayedItems.length);
  }, [lightboxIndex, displayedItems.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, showNext, showPrev]);

  // Touch swipe for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) showNext();
    else if (distance < -50) showPrev();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentImage = lightboxIndex !== null ? displayedItems[lightboxIndex] : null;

  return (
    <section className="w-full max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 sm:py-16">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-black uppercase tracking-wider">
            <span>Global Operations & Trade Exhibitions</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            International <span className="text-emerald-700">Footprint & Sourcing</span>
          </h2>

          <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed">
            Direct glimpses into our delegations at the 137th Canton Fair, Kuala Lumpur international property expos, and executive client advisory sessions across global trade capitals.
          </p>
        </div>

        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-600 text-slate-700 hover:text-emerald-800 text-xs font-bold transition shadow-sm self-start md:self-auto group cursor-pointer"
        >
          <span>View All Gallery Photos</span>
          <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* RESPONSIVE PHOTO CARDS GRID (1 col mobile, 2 col tablet, 3 col desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {displayedItems.map((item, index) => (
          <article
            key={item.id}
            onClick={() => openLightbox(index)}
            className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 hover:border-emerald-500/60 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            {/* Image Frame (Completely Unobscured, No Text Overlaid on Faces/Flyers) */}
            <div className="relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-slate-100">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                priority={index < 3}
              />

              {/* Floating Category Pill on Top-Left */}
              <div className="absolute top-3.5 left-3.5 z-10">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/75 backdrop-blur-md text-emerald-300 border border-white/10 shadow-sm">
                  {item.category}
                </span>
              </div>

              {/* Hover Zoom Icon */}
              <div className="absolute inset-0 bg-slate-950/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-all duration-300">
                  <Maximize2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Clean Content Area (Below Photo, With Proper Typography & Breathing Room) */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3.5 bg-white">
              <div className="space-y-2">
                {/* Meta Row: Location & Date */}
                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                  {item.location && (
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate max-w-[200px]">{item.location}</span>
                    </div>
                  )}
                  {item.eventDate && (
                    <div className="flex items-center gap-1 text-slate-400 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.eventDate}</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug line-clamp-2">
                  {item.title}
                </h3>

                {/* Description */}
                {item.description && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 sm:line-clamp-3">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* BOTTOM BUTTON */}
      <div className="flex justify-center pt-8 sm:pt-10">
        <Link
          href="/gallery"
          className="px-8 py-3.5 bg-emerald-900 hover:bg-emerald-950 text-white rounded-2xl text-xs font-extrabold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group border border-emerald-800 cursor-pointer"
        >
          <span>Explore All Exhibition & Sourcing Photos</span>
          <ArrowRight className="w-4 h-4 text-emerald-300 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL (Responsive on Mobile & Desktop, Touch-Swipe Enabled) */}
      {currentImage && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar with Counter & Close */}
          <div
            className="flex items-center justify-between z-20 text-white w-full max-w-6xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-emerald-400 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-full">
                Photo {(lightboxIndex ?? 0) + 1} of {displayedItems.length}
              </span>
              <span className="hidden sm:inline-block text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-300">
                {currentImage.category}
              </span>
            </div>

            <button
              onClick={closeLightbox}
              className="p-2 sm:p-2.5 rounded-full bg-slate-900 border border-slate-700 hover:border-emerald-400 text-slate-300 hover:text-white transition cursor-pointer min-w-[42px] min-h-[42px] flex items-center justify-center"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center Image with Previous / Next Arrows */}
          <div
            className="flex-1 relative flex items-center justify-center my-3 sm:my-4 overflow-hidden w-full max-w-6xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev button */}
            {displayedItems.length > 1 && (
              <button
                onClick={showPrev}
                className="absolute left-1 sm:left-4 z-20 p-2.5 sm:p-3.5 rounded-full bg-slate-900/80 hover:bg-emerald-500 hover:text-slate-950 text-white border border-slate-700 hover:border-emerald-400 transition-all shadow-2xl cursor-pointer min-w-[42px] min-h-[42px] flex items-center justify-center"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            {/* Main Image */}
            <div className="relative w-full h-[55vh] sm:h-[65vh] lg:h-[72vh] flex items-center justify-center">
              <Image
                src={currentImage.imageUrl}
                alt={currentImage.title}
                fill
                className="object-contain rounded-2xl drop-shadow-2xl"
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority
              />
            </div>

            {/* Next button */}
            {displayedItems.length > 1 && (
              <button
                onClick={showNext}
                className="absolute right-1 sm:right-4 z-20 p-2.5 sm:p-3.5 rounded-full bg-slate-900/80 hover:bg-emerald-500 hover:text-slate-950 text-white border border-slate-700 hover:border-emerald-400 transition-all shadow-2xl cursor-pointer min-w-[42px] min-h-[42px] flex items-center justify-center"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>

          {/* Bottom Card info */}
          <div
            className="z-20 max-w-4xl mx-auto w-full space-y-2.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3.5 sm:p-4 rounded-2xl text-center space-y-1 text-white shadow-xl">
              <h4 className="text-sm sm:text-base font-black tracking-tight text-white">
                {currentImage.title}
              </h4>
              {currentImage.description && (
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  {currentImage.description}
                </p>
              )}
              {currentImage.location && (
                <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-semibold pt-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{currentImage.location}</span>
                  {currentImage.eventDate && <span>• {currentImage.eventDate}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
