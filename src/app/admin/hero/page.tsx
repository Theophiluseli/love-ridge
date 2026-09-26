'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  CheckCircle,
  Eye,
  Image as ImageIcon,
  RotateCcw,
  Play,
  Pause,
  Layers,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  Sliders,
  Type,
  Building2,
  Package,
  Info,
  Briefcase,
  PhoneCall
} from 'lucide-react';
import { compressImage } from '@/lib/utils/imageCompressor';
import { PageHeroConfig, PageHeroConfigs, DEFAULT_PAGE_HEROES } from '@/lib/page-heroes-constants';

interface HeroSlideItem {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  active: boolean;
  order: number;
}

const DEFAULT_SLIDES: HeroSlideItem[] = [
  { id: 'slide-1', imageUrl: '/hero_carousel_1.jpg', title: 'Luxury Smart Villa Showcase', active: true, order: 1 },
  { id: 'slide-2', imageUrl: '/hero_carousel_2.jpg', title: 'Modern Estate Residence', active: true, order: 2 },
  { id: 'slide-4', imageUrl: '/hero_carousel_4.jpg', title: 'Executive Living Spaces', active: true, order: 3 },
  { id: 'slide-5', imageUrl: '/signature_apartment_accra.webp', title: 'Signature Residential Complex', active: true, order: 4 },
];

const PAGE_KEYS = [
  { key: 'properties', label: 'Properties & Commercial Listings', path: '/properties', icon: Building2, tag: 'Property Listings' },
  { key: 'products', label: 'Building Materials & Tools Store', path: '/products', icon: Package, tag: 'Online Store' },
  { key: 'about', label: 'About Us Page', path: '/about', icon: Info, tag: 'Company Profile' },
  { key: 'services', label: 'Services Page', path: '/services', icon: Briefcase, tag: 'Consultancy' },
  { key: 'contact', label: 'Contact Us Page', path: '/contact', icon: PhoneCall, tag: 'Inquiries & Desk' },
] as const;

export default function AdminHeroPage() {
  const [activeTab, setActiveTab] = useState<'slides' | 'content'>('slides');
  const [slides, setSlides] = useState<HeroSlideItem[]>([]);
  const [pageHeroes, setPageHeroes] = useState<PageHeroConfigs>(DEFAULT_PAGE_HEROES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Live Preview State
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewAutoplay, setPreviewAutoplay] = useState(true);

  // New Slide Form State
  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  function isDefaultSlides(items: HeroSlideItem[]) {
    if (!items || items.length !== DEFAULT_SLIDES.length) return false;
    return items.every((item, idx) => item.imageUrl === DEFAULT_SLIDES[idx]?.imageUrl);
  }

  async function fetchInitialData() {
    // 1. Immediately read from localStorage so it never flashes to default
    let localSlides: HeroSlideItem[] | null = null;
    try {
      const localSaved = localStorage.getItem('loveridge_hero_slides');
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localSlides = parsed;
          setSlides(parsed);
          setLoading(false);
        }
      }
      const localHeroes = localStorage.getItem('loveridge_page_heroes');
      if (localHeroes) {
        const parsedHeroes = JSON.parse(localHeroes);
        if (parsedHeroes && typeof parsedHeroes === 'object') {
          setPageHeroes({ ...DEFAULT_PAGE_HEROES, ...parsedHeroes });
        }
      }
    } catch (e) {}

    try {
      const [resSlides, resHeroes] = await Promise.all([
        fetch('/api/hero-slides', { cache: 'no-store' }),
        fetch('/api/page-heroes', { cache: 'no-store' }),
      ]);

      const dataSlides = await resSlides.json();
      const dataHeroes = await resHeroes.json();

      // Handle Hero Slides
      if (dataSlides.slides && Array.isArray(dataSlides.slides) && dataSlides.slides.length > 0) {
        if (!dataSlides.isDefault) {
          setSlides(dataSlides.slides);
          localStorage.setItem('loveridge_hero_slides', JSON.stringify(dataSlides.slides));
        } else if (localSlides && localSlides.length > 0 && !isDefaultSlides(localSlides)) {
          setSlides(localSlides);
          persistSlides(localSlides);
        } else {
          setSlides(dataSlides.slides);
          localStorage.setItem('loveridge_hero_slides', JSON.stringify(dataSlides.slides));
        }
      } else if (localSlides && localSlides.length > 0) {
        setSlides(localSlides);
      } else {
        setSlides(DEFAULT_SLIDES);
      }

      // Handle Page Heroes
      if (dataHeroes.heroes && typeof dataHeroes.heroes === 'object') {
        const merged = { ...DEFAULT_PAGE_HEROES, ...dataHeroes.heroes };
        setPageHeroes(merged);
        localStorage.setItem('loveridge_page_heroes', JSON.stringify(merged));
      }
    } catch (err) {
      console.error('Error fetching hero data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Auto-play for live preview box
  useEffect(() => {
    if (!previewAutoplay || slides.length === 0) return;
    const activeSlides = slides.filter((s) => s.active);
    if (activeSlides.length === 0) return;

    const timer = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % activeSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [previewAutoplay, slides]);

  const activeSlides = slides.filter((s) => s.active);
  const currentPreviewSlide = activeSlides[previewIndex % (activeSlides.length || 1)] || slides[0] || {
    imageUrl: '/hero_carousel_1.jpg',
    title: 'Hero Showcase',
  };

  async function persistSlides(updatedSlides: HeroSlideItem[]) {
    localStorage.setItem('loveridge_hero_slides', JSON.stringify(updatedSlides));
    setSlides(updatedSlides);
    window.dispatchEvent(new Event('hero-slides-updated'));
    window.dispatchEvent(new Event('storage'));

    try {
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('loveridge_hero_sync');
        bc.postMessage({ type: 'hero-slides-updated', timestamp: Date.now() });
        bc.close();
      }
    } catch (_) {}

    try {
      const res = await fetch('/api/hero-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: updatedSlides }),
      });
      const data = await res.json();
      const finalSlides = (data && Array.isArray(data.slides)) ? data.slides : updatedSlides;

      localStorage.setItem('loveridge_hero_slides', JSON.stringify(finalSlides));
      setSlides(finalSlides);
      window.dispatchEvent(new Event('hero-slides-updated'));
      window.dispatchEvent(new Event('storage'));
      return finalSlides;
    } catch (err) {
      console.warn('Background sync hero slides error:', err);
      return updatedSlides;
    }
  }

  async function persistPageHeroes(updatedHeroes: PageHeroConfigs) {
    localStorage.setItem('loveridge_page_heroes', JSON.stringify(updatedHeroes));
    setPageHeroes(updatedHeroes);
    window.dispatchEvent(new Event('page-heroes-updated'));
    window.dispatchEvent(new Event('storage'));

    try {
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('loveridge_hero_sync');
        bc.postMessage({ type: 'page-heroes-updated', timestamp: Date.now() });
        bc.close();
      }
    } catch (_) {}

    try {
      const res = await fetch('/api/page-heroes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroes: updatedHeroes }),
      });
      const data = await res.json();
      const finalHeroes = (data && data.heroes) ? data.heroes : updatedHeroes;
      localStorage.setItem('loveridge_page_heroes', JSON.stringify(finalHeroes));
      setPageHeroes(finalHeroes);
      window.dispatchEvent(new Event('page-heroes-updated'));
      window.dispatchEvent(new Event('storage'));
      return finalHeroes;
    } catch (err) {
      console.warn('Background sync page heroes error:', err);
      return updatedHeroes;
    }
  }

  async function handleSaveAll() {
    setSaving(true);
    setMessage('');
    setErrorMessage('');
    try {
      await Promise.all([
        persistSlides(slides),
        persistPageHeroes(pageHeroes),
      ]);
      setMessage('Hero section updated & saved successfully! Live changes are now active across Homepage, Properties, Store, About, Services, and Contact pages in real-time.');
      setTimeout(() => setMessage(''), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving hero settings.');
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const newItems: HeroSlideItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedBase64 = await compressImage(file, 1920, 1080, 0.85, false);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileData: compressedBase64, fileName: `hero_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}` }),
        });
        const uploadData = await uploadRes.json();
        const finalUrl = uploadData.url || compressedBase64;

        newItems.push({
          id: `hero-${Date.now()}-${i}`,
          imageUrl: finalUrl,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'New Luxury Slide',
          active: true,
          order: slides.length + i + 1,
        });
      }

      const merged = [...slides, ...newItems];
      await persistSlides(merged);
      setMessage(`Successfully uploaded and saved ${newItems.length} new hero background slide(s)! Live across all pages.`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage('Upload error: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleReplaceSingleImage(slideIndex: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const compressedBase64 = await compressImage(file, 1920, 1080, 0.85, false);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData: compressedBase64, fileName: `hero_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}` }),
      });
      const uploadData = await uploadRes.json();
      const finalUrl = uploadData.url || compressedBase64;

      const updated = [...slides];
      updated[slideIndex].imageUrl = finalUrl;
      await persistSlides(updated);
      setMessage(`Slide image replaced successfully!`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage('Replacement error: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function handleAddSlideByUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!newSlideUrl.trim()) return;

    const newItem: HeroSlideItem = {
      id: `hero-${Date.now()}`,
      imageUrl: newSlideUrl.trim(),
      title: newSlideTitle.trim() || 'Custom Hero Slide',
      active: true,
      order: slides.length + 1,
    };

    const merged = [...slides, newItem];
    persistSlides(merged);
    setNewSlideUrl('');
    setNewSlideTitle('');
    setShowAddForm(false);
    setMessage('New hero slide added successfully!');
    setTimeout(() => setMessage(''), 3000);
  }

  function toggleSlideActive(index: number) {
    const updated = [...slides];
    updated[index].active = !updated[index].active;
    persistSlides(updated);
  }

  function updateSlideTitle(index: number, newTitle: string) {
    const updated = [...slides];
    updated[index].title = newTitle;
    setSlides(updated);
  }

  function updateSlideUrl(index: number, newUrl: string) {
    const updated = [...slides];
    updated[index].imageUrl = newUrl;
    setSlides(updated);
  }

  function moveSlide(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slides.length - 1) return;

    const updated = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    updated.forEach((s, idx) => {
      s.order = idx + 1;
    });

    persistSlides(updated);
  }

  function deleteSlide(id: string) {
    if (slides.length <= 1) {
      alert('You must keep at least 1 hero background slide.');
      return;
    }
    if (confirm('Are you sure you want to remove this background slide from the hero carousel?')) {
      const updated = slides.filter((s) => s.id !== id);
      updated.forEach((s, idx) => {
        s.order = idx + 1;
      });
      persistSlides(updated);
      setMessage('Slide removed.');
      setTimeout(() => setMessage(''), 3000);
    }
  }

  function resetToDefault() {
    if (confirm('Reset hero slides and page hero headers back to initial defaults?')) {
      persistSlides(DEFAULT_SLIDES);
      persistPageHeroes(DEFAULT_PAGE_HEROES);
      setMessage('Hero carousel slides & page headers have been reset to factory defaults.');
      setTimeout(() => setMessage(''), 4000);
    }
  }

  function updatePageHero(pageKey: string, field: keyof PageHeroConfig, value: string) {
    setPageHeroes((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        [field]: value,
      },
    }));
  }

  function resetSinglePageHero(pageKey: string) {
    if (DEFAULT_PAGE_HEROES[pageKey]) {
      setPageHeroes((prev) => ({
        ...prev,
        [pageKey]: { ...DEFAULT_PAGE_HEROES[pageKey] },
      }));
      setMessage(`Reset ${pageKey} hero title & subtitle to default.`);
      setTimeout(() => setMessage(''), 3000);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-800 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Loading Hero Management Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Hero Section Multi-Page Manager
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefault}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Reset to initial default slides & headers"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving || uploading}
            className="gradient-btn px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save All Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('slides')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition cursor-pointer ${
            activeTab === 'slides'
              ? 'border-emerald-800 text-emerald-900 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Background Slides ({slides.length})</span>
          <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-900 font-bold">
            All 6 Pages
          </span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition cursor-pointer ${
            activeTab === 'content'
              ? 'border-emerald-800 text-emerald-900 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Page Hero Titles & Subtitles</span>
        </button>
      </div>

      {/* Alert Banners */}
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs rounded-2xl font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 text-xs rounded-2xl font-bold flex items-center gap-2 shadow-sm">
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: BACKGROUND CAROUSEL SLIDES */}
      {activeTab === 'slides' && (
        <div className="space-y-8">
          {/* Live Simulator Preview Box */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> Live Hero Background Simulator ({activeSlides.length} Active Slides)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewAutoplay(!previewAutoplay)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${
                    previewAutoplay
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {previewAutoplay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {previewAutoplay ? 'Pause Cycle' : 'Play Cycle'}
                </button>

                <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
                  <button
                    onClick={() =>
                      setPreviewIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1))
                    }
                    className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                    title="Previous Slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono font-bold px-2 text-slate-300">
                    {activeSlides.length > 0 ? (previewIndex % activeSlides.length) + 1 : 0} / {activeSlides.length}
                  </span>
                  <button
                    onClick={() => setPreviewIndex((prev) => (prev + 1) % activeSlides.length)}
                    className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                    title="Next Slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Canvas Simulation Box */}
            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
              <img
                src={currentPreviewSlide.imageUrl}
                alt="Hero Preview"
                className="w-full h-full object-cover transition-all duration-700"
              />
              <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/25 to-emerald-950/40" />

              {/* Foreground Content Mockup */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3 z-10 pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                  Active Slide #{previewIndex + 1}: {currentPreviewSlide.title || 'Executive Showcase'}
                </span>
                <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                  Loveridge Properties & Building Materials
                </h2>
                <p className="text-xs text-slate-300 max-w-lg mx-auto font-medium drop-shadow-sm">
                  This background photo cycles continuously across Homepage, Properties, Store, About, Services, and Contact.
                </p>
              </div>

              {/* Slide Indicator Bar */}
              <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-1.5 z-20">
                {activeSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPreviewIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === previewIndex % (activeSlides.length || 1)
                        ? 'w-6 bg-emerald-400'
                        : 'w-1.5 bg-white/40 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Catalog & Upload Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-800" /> Active Hero Slides Catalog ({slides.length} Total)
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Upload images or paste URLs. Changes are instantly pushed to all visitor screens.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Processing & Optimizing...' : 'Upload Image Files'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add via URL
                </button>
              </div>
            </div>

            {/* URL Add Modal/Dropdown */}
            {showAddForm && (
              <form onSubmit={handleAddSlideByUrl} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Add New Hero Background Image URL</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Image URL</label>
                    <input
                      type="url"
                      required
                      placeholder="https://... or /image.webp"
                      value={newSlideUrl}
                      onChange={(e) => setNewSlideUrl(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:border-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Slide Title / Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Luxury Apartment Living Room"
                      value={newSlideTitle}
                      onChange={(e) => setNewSlideTitle(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:border-emerald-700"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="gradient-btn px-5 py-2 rounded-xl text-xs font-bold shadow cursor-pointer"
                  >
                    Add Slide to Carousel
                  </button>
                </div>
              </form>
            )}

            {/* Slides Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {slides.map((slide, idx) => (
                <div
                  key={slide.id || idx}
                  className={`rounded-2xl border transition-all p-4 flex flex-col justify-between space-y-4 ${
                    slide.active
                      ? 'border-slate-200 bg-white hover:border-emerald-500 shadow-sm hover:shadow-md'
                      : 'border-slate-200/60 bg-slate-50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 relative group">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title || `Hero Slide ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-slate-950/80 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </div>
                    </div>

                    {/* Meta info & controls */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          Slide #{idx + 1}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveSlide(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600 cursor-pointer"
                            title="Move Up in Order"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveSlide(idx, 'down')}
                            disabled={idx === slides.length - 1}
                            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600 cursor-pointer"
                            title="Move Down in Order"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Slide Title</label>
                        <input
                          type="text"
                          value={slide.title || ''}
                          onChange={(e) => updateSlideTitle(idx, e.target.value)}
                          placeholder="Slide Title..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-emerald-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={slide.imageUrl}
                        onChange={(e) => updateSlideUrl(idx, e.target.value)}
                        placeholder="Image URL..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-slate-700 truncate"
                      />
                      <label className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-[10px] font-bold cursor-pointer transition shrink-0 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Replace
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleReplaceSingleImage(idx, e)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={slide.active}
                          onChange={() => toggleSlideActive(idx)}
                          className="w-4 h-4 text-emerald-800 rounded border-slate-300"
                        />
                        <span className="text-xs font-bold text-slate-700">
                          {slide.active ? 'Active on All Pages' : 'Disabled'}
                        </span>
                      </label>

                      <button
                        onClick={() => deleteSlide(slide.id)}
                        className="p-1 rounded text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAGE HERO TITLES & SUBTITLES */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Type className="w-5 h-5 text-emerald-800" /> Per-Page Hero Header Customization
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Customize the headline title, emerald highlight accent, and descriptive subtitle for each specific page. When saved, all client browsers update immediately.
              </p>
            </div>

            <div className="space-y-6">
              {PAGE_KEYS.map((page) => {
                const Icon = page.icon;
                const heroData = pageHeroes[page.key] || DEFAULT_PAGE_HEROES[page.key];

                return (
                  <div
                    key={page.key}
                    className="p-5 sm:p-6 bg-slate-50/70 border border-slate-200 rounded-2xl hover:border-emerald-500 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{page.label}</h4>
                          <span className="text-[11px] font-mono text-slate-500">{page.path}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => resetSinglePageHero(page.key)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg flex items-center gap-1 cursor-pointer"
                          title="Reset to default text for this page"
                        >
                          <RotateCcw className="w-3 h-3" /> Reset
                        </button>

                        <Link
                          href={page.path}
                          target="_blank"
                          className="px-3 py-1 text-[11px] font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg flex items-center gap-1"
                        >
                          View Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Main Title */}
                      <div className="lg:col-span-2 space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Headline Title
                        </label>
                        <input
                          type="text"
                          value={heroData.title || ''}
                          onChange={(e) => updatePageHero(page.key, 'title', e.target.value)}
                          placeholder="e.g. Properties & Commercial Listings"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-emerald-700 shadow-2xs"
                        />
                      </div>

                      {/* Highlighted Accent Text */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Green Highlight Words
                        </label>
                        <input
                          type="text"
                          value={heroData.highlightText || ''}
                          onChange={(e) => updatePageHero(page.key, 'highlightText', e.target.value)}
                          placeholder="e.g. Commercial Listings"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-emerald-800 focus:border-emerald-700 shadow-2xs"
                        />
                      </div>

                      {/* Subtitle Paragraph */}
                      <div className="lg:col-span-3 space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Subtitle Paragraph
                        </label>
                        <textarea
                          rows={2}
                          value={heroData.subtitle || ''}
                          onChange={(e) => updatePageHero(page.key, 'subtitle', e.target.value)}
                          placeholder="Brief descriptive paragraph shown beneath headline..."
                          className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-700 focus:border-emerald-700 shadow-2xs leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Save Action */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="gradient-btn px-7 py-3 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving All Hero Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Page Hero Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
