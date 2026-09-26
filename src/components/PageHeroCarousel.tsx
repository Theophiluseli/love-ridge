'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

export const DEFAULT_PAGE_SLIDES = [
  '/hero_carousel_1.jpg',
  '/hero_carousel_2.jpg',
  '/hero_carousel_4.jpg',
  '/signature_apartment_accra.webp',
  '/hero_villa_bg.webp',
  '/hero_complex_bg.webp',
  '/loveridge-consultation-bg.jpg',
];

interface PageHeroCarouselProps {
  pageKey?: 'properties' | 'products' | 'about' | 'services' | 'contact' | 'gallery';
  badge?: {
    icon?: React.ReactNode;
    text: string;
  };
  title: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
  slides?: string[];
  className?: string;
}

export default function PageHeroCarousel({
  pageKey,
  badge,
  title,
  subtitle,
  children,
  slides: initialSlides,
  className = '',
}: PageHeroCarouselProps) {
  const [heroSlide, setHeroSlide] = useState(0);
  const [slideList, setSlideList] = useState<string[]>(() => {
    if (initialSlides && initialSlides.length > 0) return initialSlides;
    if (typeof window !== 'undefined') {
      try {
        const localSaved = localStorage.getItem('loveridge_hero_slides');
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const active = parsed.filter((s: any) => s.active).map((s: any) => s.imageUrl);
            if (active.length > 0) return active;
          }
        }
      } catch (_) {}
    }
    return DEFAULT_PAGE_SLIDES;
  });

  const [dynamicHero, setDynamicHero] = useState<{
    title?: string;
    highlightText?: string;
    subtitle?: string;
  } | null>(() => {
    if (!pageKey || typeof window === 'undefined') return null;
    try {
      const localSaved = localStorage.getItem('loveridge_page_heroes');
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (parsed && parsed[pageKey]) return parsed[pageKey];
      }
    } catch (_) {}
    return null;
  });

  // Load latest hero background slides from database API
  const loadHeroSlides = useCallback(async () => {
    if (initialSlides && initialSlides.length > 0) return;
    try {
      // 1. Instant check from localStorage
      const localSaved = localStorage.getItem('loveridge_hero_slides');
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const active = parsed.filter((s: any) => s.active).map((s: any) => s.imageUrl);
          if (active.length > 0) {
            setSlideList(active);
          }
        }
      }

      // 2. Fresh fetch from serverless API
      const res = await fetch(`/api/hero-slides?_t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.slides && Array.isArray(data.slides) && data.slides.length > 0) {
        const active = data.slides.filter((s: any) => s.active).map((s: any) => s.imageUrl);
        if (active.length > 0) {
          setSlideList(active);
          if (!data.isDefault) {
            localStorage.setItem('loveridge_hero_slides', JSON.stringify(data.slides));
          }
        }
      }
    } catch (e) {
      // Keep existing slideList on network failure
    }
  }, [initialSlides]);

  // Load latest page hero texts (title & subtitle) from database API
  const loadPageHeroes = useCallback(async () => {
    if (!pageKey) return;
    try {
      // 1. Instant check from localStorage
      const localSaved = localStorage.getItem('loveridge_page_heroes');
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (parsed && parsed[pageKey]) {
          setDynamicHero(parsed[pageKey]);
        }
      }

      // 2. Fresh fetch from serverless API
      const res = await fetch(`/api/page-heroes?_t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.heroes && data.heroes[pageKey]) {
        setDynamicHero(data.heroes[pageKey]);
        if (!data.isDefault) {
          localStorage.setItem('loveridge_page_heroes', JSON.stringify(data.heroes));
        }
      }
    } catch (e) {
      // Keep existing dynamicHero on error
    }
  }, [pageKey]);

  useEffect(() => {
    loadHeroSlides();
    loadPageHeroes();

    const handleUpdate = () => {
      loadHeroSlides();
      loadPageHeroes();
    };

    window.addEventListener('hero-slides-updated', handleUpdate);
    window.addEventListener('page-heroes-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Multi-tab BroadcastChannel listener
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('loveridge_hero_sync');
        bc.onmessage = () => {
          loadHeroSlides();
          loadPageHeroes();
        };
      }
    } catch (_) {}

    return () => {
      window.removeEventListener('hero-slides-updated', handleUpdate);
      window.removeEventListener('page-heroes-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      if (bc) {
        try {
          bc.close();
        } catch (_) {}
      }
    };
  }, [loadHeroSlides, loadPageHeroes]);

  // Real-time synchronization across devices (Supabase Realtime)
  useRealtimeSync((type) => {
    if (type === 'hero') {
      loadHeroSlides();
      loadPageHeroes();
    }
  });

  // Autoplay carousel timer
  useEffect(() => {
    if (slideList.length === 0) return;
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % slideList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slideList.length]);

  // Compute final title & subtitle (dynamic overrides if set in Admin, else standard props)
  let activeTitle: React.ReactNode = title;
  if (dynamicHero?.title) {
    if (dynamicHero.highlightText && dynamicHero.title.includes(dynamicHero.highlightText)) {
      const parts = dynamicHero.title.split(dynamicHero.highlightText);
      activeTitle = (
        <>
          {parts[0]}
          <span className="text-emerald-400">{dynamicHero.highlightText}</span>
          {parts.slice(1).join(dynamicHero.highlightText)}
        </>
      );
    } else {
      activeTitle = dynamicHero.title;
    }
  }

  const activeSubtitle = dynamicHero?.subtitle || subtitle;

  return (
    <section
      className={`relative bg-slate-950 pt-28 sm:pt-36 lg:pt-40 pb-20 sm:pb-28 lg:pb-32 px-4 sm:px-6 lg:px-8 xl:px-12 -mt-20 overflow-hidden border-b border-slate-800 min-h-[460px] sm:min-h-[520px] lg:min-h-[560px] flex flex-col justify-center ${className}`}
    >
      {/* Background Carousel Images Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {slideList.map((img, idx) => (
          <div
            key={`${img}-${idx}`}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 transform ${
              idx === heroSlide ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
            style={{ backgroundImage: `url('${img}')` }}
          />
        ))}

        {/* Luxury Brand Gradient & Glass Overlay (Brightened for vivid background clarity) */}
        <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/25 to-emerald-950/40" />
      </div>

      {/* Carousel Prev/Next Navigation Buttons */}
      {slideList.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setHeroSlide((prev) => (prev === 0 ? slideList.length - 1 : prev - 1))}
            className="hidden sm:flex absolute left-2 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white border border-white/20 backdrop-blur-md items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-xl"
            title="Previous slide"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>

          <button
            type="button"
            onClick={() => setHeroSlide((prev) => (prev + 1) % slideList.length)}
            className="hidden sm:flex absolute right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white border border-white/20 backdrop-blur-md items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-xl"
            title="Next slide"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </>
      )}

      {/* Carousel Content Container */}
      <div className="relative z-10 w-full max-w-[1650px] mx-auto space-y-6 sm:space-y-8 text-center my-auto">
        {/* Optional Badge */}
        {badge && (
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
              {badge.icon}
              <span>{badge.text}</span>
            </div>
          </div>
        )}

        {/* Header Title & Subtitle */}
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 pt-1 sm:pt-2">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white drop-shadow-md leading-tight">
            {activeTitle}
          </h1>
          {activeSubtitle && (
            <p className="text-xs sm:text-sm md:text-base text-slate-200 max-w-3xl mx-auto font-medium drop-shadow-sm leading-relaxed">
              {activeSubtitle}
            </p>
          )}
        </div>

        {/* Children details (filter pills, search boxes, quick stats, etc.) */}
        {children}

        {/* Slide Indicator Dots */}
        {slideList.length > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4 sm:pt-6">
            {slideList.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setHeroSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === heroSlide ? 'w-6 bg-emerald-400' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
                title={`Go to slide ${idx + 1}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
