'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
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
  Link as LinkIcon
} from 'lucide-react';
import { compressImage } from '@/lib/utils/imageCompressor';

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
  { id: 'slide-3', imageUrl: '/hero_carousel_3.jpg', title: 'Commercial Suites & Lands', active: true, order: 3 },
  { id: 'slide-4', imageUrl: '/hero_carousel_4.jpg', title: 'Executive Living Spaces', active: true, order: 4 },
];

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroSlideItem[]>([]);
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
    fetchSlides();
  }, []);

  function isDefaultSlides(items: HeroSlideItem[]) {
    if (!items || items.length !== DEFAULT_SLIDES.length) return false;
    return items.every((item, idx) => item.imageUrl === DEFAULT_SLIDES[idx]?.imageUrl);
  }

  async function fetchSlides() {
    // 1. Immediately read from localStorage so it never flashes to default
    let localSlides: HeroSlideItem[] | null = null;
    const localSaved = localStorage.getItem('loveridge_hero_slides');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localSlides = parsed;
          setSlides(parsed);
          setLoading(false);
        }
      } catch (e) {}
    }

    try {
      const res = await fetch('/api/hero-slides', { cache: 'no-store' });
      const data = await res.json();

      if (data.slides && Array.isArray(data.slides) && data.slides.length > 0) {
        if (!data.isDefault) {
          // Server returned custom slides saved in DB
          setSlides(data.slides);
          localStorage.setItem('loveridge_hero_slides', JSON.stringify(data.slides));
        } else if (localSlides && localSlides.length > 0 && !isDefaultSlides(localSlides)) {
          // Client has custom slides! Preserve them and sync to server DB:
          setSlides(localSlides);
          persistSlides(localSlides);
        } else {
          setSlides(data.slides);
          localStorage.setItem('loveridge_hero_slides', JSON.stringify(data.slides));
        }
      } else if (localSlides && localSlides.length > 0) {
        setSlides(localSlides);
      } else {
        setSlides(DEFAULT_SLIDES);
      }
    } catch (err) {
      console.error('Error fetching hero slides:', err);
      if (localSlides && localSlides.length > 0) {
        setSlides(localSlides);
      } else {
        setSlides(DEFAULT_SLIDES);
      }
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
    // 1. Save immediately to local storage and state for instant response
    localStorage.setItem('loveridge_hero_slides', JSON.stringify(updatedSlides));
    setSlides(updatedSlides);
    window.dispatchEvent(new Event('hero-slides-updated'));
    window.dispatchEvent(new Event('storage'));

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

  async function handleSaveAll() {
    setSaving(true);
    setMessage('');
    setErrorMessage('');
    try {
      await persistSlides(slides);
      setMessage('Hero background carousel updated & saved successfully! Homepage background is now live and persistent across refreshes.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving hero background slides.');
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
        let imageUrl = '';

        try {
          const formData = new FormData();
          formData.append('file', file);
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const uploadData = await uploadRes.json();
          if (uploadRes.ok && uploadData.url) {
            imageUrl = uploadData.url;
          }
        } catch (upErr) {
          console.warn('Upload API failed, using compressed fallback:', upErr);
        }

        if (!imageUrl) {
          imageUrl = await compressImage(file, 1600, 900, 0.70);
        }

        newItems.push({
          id: `hero-${Date.now()}-${i}`,
          imageUrl,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          active: true,
          order: slides.length + i + 1,
        });
      }

      const nextSlides = [...slides, ...newItems];
      await persistSlides(nextSlides);
      setShowAddForm(false);
      setMessage(`Successfully uploaded and saved ${newItems.length} new hero background slide(s)!`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      alert('Failed to process image file: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleReplaceSingleImage(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const file = files[0];
      let imageUrl = '';

      try {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.url) {
          imageUrl = uploadData.url;
        }
      } catch (upErr) {
        console.warn('Upload API failed, using compressed fallback:', upErr);
      }

      if (!imageUrl) {
        imageUrl = await compressImage(file, 1600, 900, 0.70);
      }

      const updated = [...slides];
      updated[index].imageUrl = imageUrl;
      await persistSlides(updated);
      setMessage(`Image for Slide #${index + 1} updated and saved successfully!`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      alert('Failed to update slide image: ' + err.message);
    } finally {
      setUploading(false);
    }
  }


  function updateSlideUrl(index: number, url: string) {
    const updated = [...slides];
    updated[index].imageUrl = url;
    setSlides(updated);
    persistSlides(updated);
  }

  function handleAddByUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!newSlideUrl.trim()) return;

    const newItem: HeroSlideItem = {
      id: `hero-${Date.now()}`,
      imageUrl: newSlideUrl.trim(),
      title: newSlideTitle.trim() || 'Custom Hero Slide',
      active: true,
      order: slides.length + 1,
    };

    const nextSlides = [...slides, newItem];
    setSlides(nextSlides);
    persistSlides(nextSlides);
    setNewSlideUrl('');
    setNewSlideTitle('');
    setShowAddForm(false);
    setMessage('Custom URL slide added and saved successfully!');
    setTimeout(() => setMessage(''), 4000);
  }

  function moveSlide(index: number, direction: 'UP' | 'DOWN') {
    const newSlides = [...slides];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    newSlides.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setSlides(newSlides);
    persistSlides(newSlides);
  }

  function toggleSlideActive(index: number) {
    const updated = [...slides];
    updated[index].active = !updated[index].active;
    setSlides(updated);
    persistSlides(updated);
  }

  function deleteSlide(id: string) {
    if (slides.length <= 1) {
      alert('You must keep at least 1 hero background slide.');
      return;
    }
    if (confirm('Are you sure you want to remove this background slide from the hero carousel?')) {
      const remaining = slides.filter((s) => s.id !== id);
      setSlides(remaining);
      persistSlides(remaining);
    }
  }

  function updateSlideTitle(index: number, title: string) {
    const updated = [...slides];
    updated[index].title = title;
    setSlides(updated);
    persistSlides(updated);
  }

  function resetToDefault() {
    if (confirm('Reset hero slides back to original 4 default luxury villa images?')) {
      setSlides(DEFAULT_SLIDES);
      persistSlides(DEFAULT_SLIDES);
    }
  }


  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Hero Section Background Carousel Manager
            </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage background images cycling on the main homepage hero section. Add, reorder, or upload custom images.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefault}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            title="Reset to initial default slides"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving || uploading}
            className="gradient-btn px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 disabled:opacity-50"
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

      {/* TOP: LIVE HOMEPAGE SIMULATED PREVIEW BOX */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4 text-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Eye className="w-4 h-4" /> Live Hero Background Simulator ({activeSlides.length} Active Slides)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewAutoplay(!previewAutoplay)}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition"
            >
              {previewAutoplay ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
              {previewAutoplay ? 'Pause Auto-Play' : 'Play Auto-Play'}
            </button>
          </div>
        </div>

        {/* Hero Canvas Simulation Box */}
        <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center p-6 text-center group">
          {currentPreviewSlide ? (
            <img
              src={currentPreviewSlide.imageUrl}
              alt="Hero Preview"
              className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 scale-100 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-xs text-slate-400 font-bold">
              No Active Background Slide Selected
            </div>
          )}

          {/* Dark Overlay matching homepage */}
          <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[1px] z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-emerald-950/70 z-10" />

          {/* Foreground Hero Content Mockup */}
          <div className="relative z-20 max-w-2xl mx-auto space-y-3 pointer-events-none">
            <span className="inline-block px-3 py-1 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-xs font-extrabold uppercase rounded-full shadow-md">
              {currentPreviewSlide.title || 'Loveridge Properties & Consultancy'}
            </span>

            <h2 className="text-xl sm:text-3xl font-black text-white leading-tight drop-shadow-md">
              Find Premium Titled Lands, Office Suites & Building Materials
            </h2>

            <div className="bg-white/95 p-2 rounded-2xl border border-slate-200 shadow-xl max-w-md mx-auto flex items-center justify-between text-xs text-slate-500 px-4">
              <span>Search Cantonments, East Legon, Ridge...</span>
              <span className="bg-emerald-800 text-white font-bold px-3 py-1 rounded-xl text-[10px]">
                Search
              </span>
            </div>
          </div>

          {/* Previous / Next Arrows in Simulator */}
          {activeSlides.length > 1 && (
            <>
              <button
                onClick={() =>
                  setPreviewIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1))
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-slate-950/70 text-white hover:bg-emerald-800 flex items-center justify-center transition border border-white/20"
                title="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setPreviewIndex((prev) => (prev + 1) % activeSlides.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-slate-950/70 text-white hover:bg-emerald-800 flex items-center justify-center transition border border-white/20"
                title="Next Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Carousel Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-slate-950/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPreviewIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === previewIndex % (activeSlides.length || 1)
                    ? 'w-6 bg-emerald-400'
                    : 'bg-white/40 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ACTION BAR: ADD NEW SLIDE TRIGGER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-800" /> Active Hero Slides Catalog ({slides.length} Total)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Upload image files or paste image URLs to include them in the cycling hero carousel.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-emerald-800 hover:bg-emerald-950 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Background Image
          </button>
        </div>

        {/* ADD SLIDE PANEL (DRAWER / FORM) */}
        {showAddForm && (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 animate-fade-in">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Add New Hero Background Image
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option A: File Upload Dropzone */}
              <div className="p-5 bg-white rounded-2xl border-2 border-dashed border-emerald-300 text-center space-y-3 flex flex-col justify-center items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Upload Local Image Files</span>
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                    Select PNG, JPG, or WebP images from your computer
                  </span>
                </div>

                <label className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm">
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" /> Choose Image Files
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Option B: Direct Image URL Form */}
              <form onSubmit={handleAddByUrl} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 block">Or Add Image by Direct URL</span>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Image URL *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={newSlideUrl}
                      onChange={(e) => setNewSlideUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="admin-input pr-8 text-xs"
                    />
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Slide Title / Tagline</label>
                  <input
                    type="text"
                    value={newSlideTitle}
                    onChange={(e) => setNewSlideTitle(e.target.value)}
                    placeholder="e.g. Modern Commercial Complex"
                    className="admin-input text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Add Slide
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SLIDE CARDS LIST (RESPONSIVE GRID) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slides.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className={`bg-white rounded-2xl p-4 border transition-all shadow-sm space-y-3 ${
                slide.active ? 'border-slate-200/90' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              {/* Image Preview Box */}
              <div className="relative h-48 rounded-xl bg-slate-900 overflow-hidden border border-slate-100 group">
                <img
                  src={slide.imageUrl}
                  alt={slide.title || `Hero Slide ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent z-10" />

                {/* Status Badges */}
                <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5">
                  <span className="bg-slate-950/80 text-white text-[10px] font-black px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                    Slide #{idx + 1}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase shadow-xs ${
                      slide.active
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-600 text-slate-200'
                    }`}
                  >
                    {slide.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                {/* Move Up/Down Controls inside preview overlay */}
                <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
                  <button
                    onClick={() => moveSlide(idx, 'UP')}
                    disabled={idx === 0}
                    className="w-7 h-7 rounded-full bg-slate-950/80 hover:bg-emerald-800 text-white flex items-center justify-center transition border border-white/20 disabled:opacity-30 disabled:hover:bg-slate-950"
                    title="Move Up in sequence"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => moveSlide(idx, 'DOWN')}
                    disabled={idx === slides.length - 1}
                    className="w-7 h-7 rounded-full bg-slate-950/80 hover:bg-emerald-800 text-white flex items-center justify-center transition border border-white/20 disabled:opacity-30 disabled:hover:bg-slate-950"
                    title="Move Down in sequence"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Direct "Change Image" Button overlay on image */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex justify-center">
                  <label className="bg-slate-950/90 hover:bg-emerald-800 text-white px-4 py-1.5 rounded-xl text-xs font-extrabold backdrop-blur-md border border-white/20 cursor-pointer shadow-lg transition flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Change Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleReplaceSingleImage(idx, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Slide Details Input & Actions */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Slide Title / Label
                  </label>
                  <input
                    type="text"
                    value={slide.title || ''}
                    onChange={(e) => updateSlideTitle(idx, e.target.value)}
                    placeholder="e.g. Executive Smart Villa"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Image URL / File Source
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={slide.imageUrl}
                      onChange={(e) => updateSlideUrl(idx, e.target.value)}
                      placeholder="Image URL..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-semibold text-slate-700 focus:border-emerald-700 font-mono truncate"
                    />
                    <label className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-[11px] font-bold cursor-pointer transition shrink-0 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-700" /> Replace
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleReplaceSingleImage(idx, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  {/* Active Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={slide.active}
                      onChange={() => toggleSlideActive(idx)}
                      className="w-4 h-4 text-emerald-800 rounded border-slate-300 focus:ring-emerald-800"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      {slide.active ? 'Enabled on Homepage' : 'Disabled'}
                    </span>
                  </label>

                  {/* Remove Button */}
                  <button
                    onClick={() => deleteSlide(slide.id)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition text-xs font-semibold flex items-center gap-1"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
