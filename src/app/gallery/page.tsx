'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeroCarousel from '@/components/PageHeroCarousel';
import {
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Filter,
  Search,
  Camera,
  Layers,
  LayoutGrid,
  Grid,
  ArrowRight,
  Share2,
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

const FALLBACK_IMAGES: GalleryItem[] = [
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

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(FALLBACK_IMAGES);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Touch swipe support for mobile lightbox
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Fetch gallery items from backend API
  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/gallery', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch gallery');
      const data = await res.json();
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        setItems(data.items);
      }
      if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.warn('Using fallback gallery items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Real-time catalog sync: new photos added by admin reflect automatically
  useRealtimeSync((type) => {
    if (type === 'gallery') {
      fetchItems();
    }
  });

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesLoc = (item.location || '').toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesCat) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedCategory, searchQuery]);

  // Dynamic slides for hero carousel
  const heroSlides = useMemo(() => {
    const list = items.slice(0, 6).map((item) => item.imageUrl);
    return list.length > 0 ? list : FALLBACK_IMAGES.map((i) => i.imageUrl);
  }, [items]);

  // Lightbox navigation
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showNext = useCallback(() => {
    if (lightboxIndex === null || filteredItems.length === 0) return;
    setLightboxIndex((prev) => (prev! + 1) % filteredItems.length);
  }, [lightboxIndex, filteredItems.length]);

  const showPrev = useCallback(() => {
    if (lightboxIndex === null || filteredItems.length === 0) return;
    setLightboxIndex((prev) => (prev! - 1 + filteredItems.length) % filteredItems.length);
  }, [lightboxIndex, filteredItems.length]);

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

  // Mobile Touch Swipe Handlers for Lightbox
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      showNext(); // Swiped left -> next
    } else if (distance < -minSwipeDistance) {
      showPrev(); // Swiped right -> prev
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentImage =
    lightboxIndex !== null && filteredItems[lightboxIndex]
      ? filteredItems[lightboxIndex]
      : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 space-y-8 sm:space-y-12">
        {/* HERO CAROUSEL */}
        <PageHeroCarousel
          title={
            <>
              Our <span className="text-emerald-400">Global Gallery</span>
            </>
          }
          subtitle="Explore our international trade exhibitions, Canton Fair material sourcing, and executive client advisory sessions across Asia, Europe, and Africa."
          slides={heroSlides}
        />

        {/* GALLERY SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28 space-y-6 sm:space-y-8">
          {/* FILTER, SEARCH & VIEW MODE TOOLBAR */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Filter Pills (Mobile Scrollable) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1.5 mr-1">
                <Filter className="w-3.5 h-3.5" />
                Category:
              </span>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Right Controls: Search & View Mode Switcher */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search gallery..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* View Switcher: Detailed Cards vs Pure Grid */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Card View with Details"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Pure Photo Grid"
                >
                  <Grid className="w-4 h-4" />
                  <span className="hidden sm:inline">Photos</span>
                </button>
              </div>
            </div>
          </div>

          {/* PHOTO DISPLAY */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="aspect-[4/3] rounded-3xl bg-slate-200 animate-pulse border border-slate-300"
                />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No photos found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No gallery pictures matched your current category or search query.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'cards' ? (
            /* RESPONSIVE CARD VIEW (Photo Unobscured on Top, Clean Metadata Below) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredItems.map((item, index) => (
                <article
                  key={item.id}
                  onClick={() => openLightbox(index)}
                  className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 hover:border-emerald-500/60 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  {/* Photo Container (Completely Unobscured, No Text Overlaid on Faces/Flyers) */}
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
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/75 backdrop-blur-md text-emerald-300 border border-white/10 shadow-sm">
                        {item.category}
                      </span>
                    </div>

                    {/* Subtle Hover Zoom Trigger Pill */}
                    <div className="absolute inset-0 bg-slate-950/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Clean Content Area (Below Photo, With Proper Hierarchy & Breathing Room) */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3.5">
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
          ) : (
            /* PURE PHOTO GRID VIEW (Clean Edge-to-Edge Photography) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => openLightbox(index)}
                  className="group relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 hover:border-emerald-500/60 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    priority={index < 3}
                  />

                  {/* Floating Category Badge */}
                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/75 backdrop-blur-md text-emerald-300 border border-white/10 shadow-sm">
                      {item.category}
                    </span>
                  </div>

                  {/* Hover overlay with zoom button */}
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <Maximize2 className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* FULLSCREEN LIGHTBOX MODAL (Responsive on Mobile & Desktop, Touch-Swipe Enabled) */}
      {currentImage && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar with Counter, Category & Close */}
          <div
            className="flex items-center justify-between z-20 text-white w-full max-w-6xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-emerald-400 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-full">
                Photo {lightboxIndex + 1} of {filteredItems.length}
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
            {filteredItems.length > 1 && (
              <button
                onClick={showPrev}
                className="absolute left-1 sm:left-4 z-20 p-2.5 sm:p-3.5 rounded-full bg-slate-900/80 hover:bg-emerald-500 hover:text-slate-950 text-white border border-slate-700 hover:border-emerald-400 transition-all shadow-2xl cursor-pointer min-w-[42px] min-h-[42px] flex items-center justify-center"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            {/* Main Image (Adaptive Responsive Sizing to prevent squishing) */}
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
            {filteredItems.length > 1 && (
              <button
                onClick={showNext}
                className="absolute right-1 sm:right-4 z-20 p-2.5 sm:p-3.5 rounded-full bg-slate-900/80 hover:bg-emerald-500 hover:text-slate-950 text-white border border-slate-700 hover:border-emerald-400 transition-all shadow-2xl cursor-pointer min-w-[42px] min-h-[42px] flex items-center justify-center"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>

          {/* Bottom Caption & Thumbnail Strip */}
          <div
            className="z-20 max-w-4xl mx-auto w-full space-y-2.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Metadata Card */}
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 sm:p-4 rounded-2xl text-center space-y-1 text-white shadow-xl">
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

            {/* Thumbnail Strip (Hidden on very small screens if crowded) */}
            {filteredItems.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 scrollbar-thin">
                {filteredItems.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setLightboxIndex(idx)}
                    className={`relative w-12 h-9 sm:w-16 sm:h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      idx === lightboxIndex
                        ? 'border-emerald-400 scale-105 ring-2 ring-emerald-400/40'
                        : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
