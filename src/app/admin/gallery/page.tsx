'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Images,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Star,
  Eye,
  CheckCircle2,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  X,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  MapPin,
  Calendar,
  Layers,
  Camera,
  Grid,
  List,
  Check,
} from 'lucide-react';
import { compressImage } from '@/lib/utils/imageCompressor';

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
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_PRESETS = [
  'Trade Exhibitions',
  'Material Sourcing',
  'Client Advisory',
  'Corporate Events',
  'Partnership Summits',
  'Project Showcases',
];

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [previewImage, setPreviewImage] = useState<GalleryItem | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Trade Exhibitions');
  const [formLocation, setFormLocation] = useState('');
  const [formEventDate, setFormEventDate] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formFeatured, setFormFeatured] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<string>('PUBLISHED');
  const [formUploadMethod, setFormUploadMethod] = useState<'file' | 'url'>('file');

  // Upload & Save processing
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const fetchGalleryItems = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/gallery?includeAll=true', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch gallery items');
      const data = await res.json();
      setItems(data.items || []);
    } catch (err: any) {
      console.error('Gallery fetch error:', err);
      showToast('Failed to load gallery items', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
  };

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Trade Exhibitions');
    setFormLocation('');
    setFormEventDate('');
    setFormImageUrl('');
    setFormFeatured(true);
    const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.sortOrder || 0)) : 0;
    setFormSortOrder(maxOrder + 1);
    setFormStatus('PUBLISHED');
    setFormUploadMethod('file');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDescription(item.description || '');
    setFormCategory(item.category || 'Trade Exhibitions');
    setFormLocation(item.location || '');
    setFormEventDate(item.eventDate || '');
    setFormImageUrl(item.imageUrl);
    setFormFeatured(item.featured);
    setFormSortOrder(item.sortOrder ?? 0);
    setFormStatus(item.status || 'PUBLISHED');
    setFormUploadMethod('url');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Handle File Upload with Compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFormError('');

    try {
      let uploadPayload: string = '';
      try {
        // Compress image cleanly without forced watermark to preserve original photo clarity
        uploadPayload = await compressImage(file, 1600, 1600, 0.82, false);
      } catch (err) {
        // Fallback to base64 reader if canvas fails
        uploadPayload = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      // Upload to server endpoint
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64: uploadPayload }),
      });

      if (!res.ok) {
        throw new Error('Image upload failed');
      }

      const data = await res.json();
      if (!data.url) throw new Error('No image URL returned by server');

      setFormImageUrl(data.url);
      showToast('Image uploaded and processed successfully!', 'success');
    } catch (err: any) {
      console.error('File upload error:', err);
      setFormError(err.message || 'Image upload failed. You can paste an image URL directly.');
      showToast('Image upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Save (Create or Update)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Please enter a photo title.');
      return;
    }
    if (!formImageUrl.trim()) {
      setFormError('Please provide or upload an image.');
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      category: formCategory.trim() || 'Trade Exhibitions',
      location: formLocation.trim(),
      eventDate: formEventDate.trim(),
      imageUrl: formImageUrl.trim(),
      featured: formFeatured,
      sortOrder: Number(formSortOrder) || 0,
      status: formStatus,
    };

    try {
      if (editingItem) {
        // PUT /api/gallery/[id]
        const res = await fetch(`/api/gallery/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to update photo');
        }

        const data = await res.json();
        setItems((prev) => prev.map((item) => (item.id === editingItem.id ? data.item : item)));
        showToast('Gallery photo updated successfully!');
      } else {
        // POST /api/gallery
        const res = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to create photo');
        }

        const data = await res.json();
        setItems((prev) => [data.item, ...prev]);
        showToast('New photo added to gallery successfully!');
      }

      setIsFormModalOpen(false);
    } catch (err: any) {
      console.error('Save error:', err);
      setFormError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  // Quick Toggle Featured
  const handleToggleFeatured = async (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedFeatured = !item.featured;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, featured: updatedFeatured } : i))
    );

    try {
      const res = await fetch(`/api/gallery/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: updatedFeatured }),
      });
      if (!res.ok) throw new Error('Toggle featured failed');
      showToast(updatedFeatured ? 'Marked as Featured' : 'Removed from Featured');
    } catch (err) {
      // Revert on error
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, featured: item.featured } : i))
      );
      showToast('Failed to update featured status', 'error');
    }
  };

  // Quick Toggle Status (PUBLISHED / DRAFT)
  const handleToggleStatus = async (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';

    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
    );

    try {
      const res = await fetch(`/api/gallery/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Status update failed');
      showToast(`Photo ${newStatus === 'PUBLISHED' ? 'Published' : 'Moved to Drafts'}`);
    } catch (err) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: item.status } : i))
      );
      showToast('Failed to update status', 'error');
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    const id = itemToDelete.id;
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');

      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast('Gallery photo deleted successfully!');
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast(err.message || 'Failed to delete photo', 'error');
    }
  };

  // Compute Categories for Filter
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    CATEGORY_PRESETS.forEach((c) => cats.add(c));
    return ['All', ...Array.from(cats)];
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesLoc = (item.location || '').toLowerCase().includes(q);
        const matchesCat = (item.category || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesCat) return false;
      }

      // Category
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Status
      if (selectedStatus !== 'All' && item.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, selectedCategory, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const published = items.filter((i) => i.status === 'PUBLISHED').length;
    const featured = items.filter((i) => i.featured).length;
    const categoriesCount = new Set(items.map((i) => i.category)).size;
    return { total, published, featured, categoriesCount };
  }, [items]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* TOAST ALERT */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-700/60 shadow-emerald-950/40'
              : 'bg-rose-950 text-rose-200 border-rose-700/60 shadow-rose-950/40'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Camera className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gallery Management
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link
            href="/gallery"
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-emerald-600 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-white hover:bg-emerald-50/50 transition shadow-sm"
          >
            <span>Public Gallery</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => fetchGalleryItems(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
            title="Refresh items"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-700' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-900/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Photo</span>
          </button>
        </div>
      </div>

      {/* METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Photos</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total}</div>
          <span className="text-[11px] text-slate-400">In database storage</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Published</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800">{stats.published}</div>
          <span className="text-[11px] text-slate-400">Live on public frontend</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Featured</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">{stats.featured}</div>
          <span className="text-[11px] text-slate-400">Hero & Home showcase</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Categories</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.categoriesCount}</div>
          <span className="text-[11px] text-slate-400">Active classifications</span>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, location, or tag..."
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

          {/* Right controls: Status filter & View Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-emerald-600"
            >
              <option value="All">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  viewMode === 'grid'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  viewMode === 'table'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {availableCategories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-sm shadow-emerald-900/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* GALLERY ITEMS DISPLAY */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading gallery photos from database...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200">
            <Images className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No photos match your filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms, changing category filters, or add a new photograph.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Photo</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              {/* Photo Frame */}
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/75 backdrop-blur-md text-emerald-300 border border-white/10 shadow-lg">
                    {item.category}
                  </span>

                  <div className="flex items-center gap-1.5 pointer-events-auto">
                    {/* Featured star toggle */}
                    <button
                      onClick={(e) => handleToggleFeatured(item, e)}
                      title={item.featured ? 'Featured on Home' : 'Click to feature'}
                      className={`p-1.5 rounded-full backdrop-blur-md border shadow transition cursor-pointer ${
                        item.featured
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-slate-950/60 text-white/70 hover:text-white border-white/10'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.featured ? 'fill-current' : ''}`} />
                    </button>

                    {/* Quick Lightbox Preview */}
                    <button
                      onClick={() => setPreviewImage(item)}
                      title="Quick Preview"
                      className="p-1.5 rounded-full bg-slate-950/60 hover:bg-slate-900 text-white/80 hover:text-white backdrop-blur-md border border-white/10 shadow transition cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Status pill */}
                <div className="absolute bottom-3 left-3 z-10">
                  <button
                    onClick={(e) => handleToggleStatus(item, e)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md border transition cursor-pointer ${
                      item.status === 'PUBLISHED'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
                        : 'bg-amber-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-900'
                    }`}
                  >
                    ● {item.status}
                  </button>
                </div>
              </div>

              {/* Information Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-black text-slate-900 line-clamp-1 group-hover:text-emerald-800 transition">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                    {item.location && (
                      <span className="flex items-center gap-1 truncate max-w-[150px]">
                        <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </span>
                    )}
                    {item.eventDate && (
                      <span className="flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{item.eventDate}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Card Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400">
                    Order: #{item.sortOrder}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-600 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => {
                        setItemToDelete(item);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 rounded-xl border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Photo</th>
                  <th className="py-3 px-4">Title & Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location / Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4 text-center">Order</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition group">
                    <td className="py-3 px-4 shrink-0">
                      <div
                        onClick={() => setPreviewImage(item)}
                        className="relative w-16 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group-hover:border-emerald-500 transition"
                      >
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 group-hover:text-emerald-800 transition line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {item.description || 'No description provided'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      <div>{item.location || '—'}</div>
                      <div className="text-slate-400 text-[10px]">{item.eventDate || ''}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => handleToggleStatus(item, e)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                          item.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {item.status}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => handleToggleFeatured(item, e)}
                        className={`p-1 rounded-full transition ${
                          item.featured ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
                        }`}
                        title="Toggle featured"
                      >
                        <Star className={`w-4 h-4 ${item.featured ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-600">
                      #{item.sortOrder}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setItemToDelete(item);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE & EDIT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {editingItem ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    {editingItem ? 'Edit Gallery Photo' : 'Add Photo to Gallery'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Provide photograph details, classification, and event information.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveItem} className="mt-5 space-y-4">
              {/* IMAGE UPLOAD / URL SELECTOR */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Photograph Image *</span>
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                    <button
                      type="button"
                      onClick={() => setFormUploadMethod('file')}
                      className={`px-2 py-0.5 rounded-md transition ${
                        formUploadMethod === 'file'
                          ? 'bg-emerald-800 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormUploadMethod('url')}
                      className={`px-2 py-0.5 rounded-md transition ${
                        formUploadMethod === 'url'
                          ? 'bg-emerald-800 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </label>

                {formUploadMethod === 'file' ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                      formImageUrl
                        ? 'border-emerald-400 bg-emerald-50/20'
                        : 'border-slate-300 hover:border-emerald-600 bg-slate-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {uploading ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="w-6 h-6 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold text-emerald-800">Optimizing & Uploading...</span>
                      </div>
                    ) : formImageUrl ? (
                      <div className="relative w-full aspect-[16/9] max-h-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                        <Image
                          src={formImageUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                          Click to Change Photo
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-xs font-bold text-slate-700">
                          Click to upload or drag & drop photograph
                        </div>
                        <p className="text-[11px] text-slate-400">
                          PNG, JPG, WEBP accepted (automatically compressed for web speed)
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="e.g. /gallery/my-exhibition.jpg or https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                    {formImageUrl && (
                      <div className="relative w-full aspect-[16/9] max-h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <Image
                          src={formImageUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
                          onError={() => setFormError('Image URL could not be rendered.')}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* TITLE */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Photo Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Kuala Lumpur International Investment Expo"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

              {/* CATEGORY & LOCATION (2 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <input
                    type="text"
                    list="category-suggestions"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Trade Exhibitions"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                  <datalist id="category-suggestions">
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Location</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Kuala Lumpur, Malaysia"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* DATE & SORT ORDER (2 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Event Date</label>
                  <input
                    type="text"
                    value={formEventDate}
                    onChange={(e) => setFormEventDate(e.target.value)}
                    placeholder="e.g. April 2025"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Display Order</label>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="Context, highlights, key partners involved..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 resize-none"
                />
              </div>

              {/* STATUS & FEATURED TOGGLE */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured-checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-600 border-slate-300"
                  />
                  <label htmlFor="featured-checkbox" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Feature on Homepage Showcase
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Status:</span>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-900/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? 'Save Changes' : 'Add to Gallery'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Delete Photo?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete this photo from the gallery?
              </p>
            </div>

            {/* Thumbnail Preview */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="relative w-14 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                <Image
                  src={itemToDelete.imageUrl}
                  alt={itemToDelete.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="truncate text-left">
                <p className="text-xs font-bold text-slate-900 truncate">{itemToDelete.title}</p>
                <p className="text-[10px] text-slate-500">{itemToDelete.category}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md shadow-rose-950/20 active:scale-95 cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK LIGHTBOX PREVIEW */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="flex items-center justify-between text-white" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold truncate max-w-md">{previewImage.title}</h4>
              <p className="text-xs text-emerald-400 font-semibold">{previewImage.category} • {previewImage.location}</p>
            </div>
            <button
              onClick={() => setPreviewImage(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 relative flex items-center justify-center my-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full h-full max-w-5xl max-h-[80vh]">
              <Image
                src={previewImage.imageUrl}
                alt={previewImage.title}
                fill
                className="object-contain rounded-2xl drop-shadow-2xl"
              />
            </div>
          </div>

          <div className="text-center text-xs text-slate-400">
            Click outside or press Esc to close preview
          </div>
        </div>
      )}
    </div>
  );
}
