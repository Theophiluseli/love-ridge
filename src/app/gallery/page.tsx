'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeroCarousel from '@/components/PageHeroCarousel';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}

const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: '1',
    src: '/gallery/kl-expo-consultation.jpg',
    alt: 'Kuala Lumpur International Investment Expo',
  },
  {
    id: '2',
    src: '/gallery/canton-fair-materials.jpg',
    alt: '137th Canton Fair Materials & Edge Banding Sourcing',
  },
  {
    id: '3',
    src: '/gallery/global-partnership-meeting.jpg',
    alt: 'Cross-Border Portfolio Consultation & Due Diligence',
  },
  {
    id: '4',
    src: '/gallery/client-document-advisory.jpg',
    alt: 'Executive Client Contract Review & Legal Advisory',
  },
  {
    id: '5',
    src: '/gallery/hardware-samples-inspection.jpg',
    alt: 'Architectural Profiles & Color Swatches Inspection',
  },
  {
    id: '6',
    src: '/gallery/executive-consultation-session.jpg',
    alt: 'Loveridge Global Trade Consultation Hub',
  },
];

export default function GalleryPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! + 1) % GALLERY_IMAGES.length);
  }, [lightboxIndex]);

  const showPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  }, [lightboxIndex]);

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

  const currentImage = lightboxIndex !== null ? GALLERY_IMAGES[lightboxIndex] : null;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 space-y-8 sm:space-y-12">
        {/* HERO CAROUSEL */}
        <PageHeroCarousel
          title={
            <>
              Our <span className="text-emerald-400">Gallery</span>
            </>
          }
          subtitle="Explore our international trade exhibitions, Canton Fair material sourcing, and executive client advisory sessions."
          slides={[
            '/gallery/kl-expo-consultation.jpg',
            '/gallery/canton-fair-materials.jpg',
            '/gallery/global-partnership-meeting.jpg',
            '/gallery/client-document-advisory.jpg',
            '/gallery/hardware-samples-inspection.jpg',
            '/gallery/executive-consultation-session.jpg',
          ]}
        />

        {/* CLEAN PHOTO GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
            {GALLERY_IMAGES.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openLightbox(index)}
                className="group relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 hover:border-emerald-500/60 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  priority={index < 3}
                />

                {/* Hover overlay with expand button */}
                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {currentImage && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
        >
          {/* Top Bar with Counter & Close */}
          <div
            className="flex items-center justify-between z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs sm:text-sm font-semibold text-emerald-400 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full">
              Photo {(lightboxIndex ?? 0) + 1} of {GALLERY_IMAGES.length}
            </span>

            <button
              onClick={closeLightbox}
              className="p-2 sm:p-2.5 rounded-full bg-slate-900 border border-slate-700 hover:border-emerald-400 text-slate-300 hover:text-white transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Center Image with Previous / Next Arrows */}
          <div
            className="flex-1 relative flex items-center justify-center my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev button */}
            <button
              onClick={showPrev}
              className="absolute left-2 sm:left-6 z-20 p-2.5 sm:p-3.5 rounded-full bg-slate-900/80 hover:bg-emerald-500 hover:text-slate-950 text-white border border-slate-700 hover:border-emerald-400 transition-all shadow-2xl cursor-pointer"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Main Image */}
            <div className="relative w-full h-full max-w-6xl max-h-[82vh] flex items-center justify-center">
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                fill
                className="object-contain rounded-2xl drop-shadow-2xl"
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority
              />
            </div>

            {/* Next button */}
            <button
              onClick={showNext}
              className="absolute right-2 sm:right-6 z-20 p-2.5 sm:p-3.5 rounded-full bg-slate-900/80 hover:bg-emerald-500 hover:text-slate-950 text-white border border-slate-700 hover:border-emerald-400 transition-all shadow-2xl cursor-pointer"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Bottom spacing */}
          <div className="h-4" />
        </div>
      )}
    </div>
  );
}
