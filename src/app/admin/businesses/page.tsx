'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Search,
  ExternalLink,
  CheckCircle2,
  Eye,
  Star,
  MapPin,
  DollarSign,
  TrendingUp,
  Building2,
  ShieldCheck,
  Upload,
  X,
  Loader2,
  User,
  Phone,
  Mail,
  FileText,
  Sparkles,
  Check,
} from 'lucide-react';
import {
  BusinessItem,
  BUSINESS_CATEGORIES,
  INITIAL_BUSINESSES_STORE,
} from '@/lib/businesses-constants';
import { formatBusinessAmount } from '@/components/BusinessCard';
import { optimizeImageToWebP } from '@/lib/utils/imageCompressor';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

interface BusinessFormState {
  id?: string;
  title: string;
  category: string;
  customCategory: string;
  location: string;
  city: string;
  region: string;
  currency: 'USD' | 'GHS' | 'EUR' | 'GBP';
  askingPrice: string;
  downPayment: string;
  sellersDiscretionaryEarnings: string;
  grossRevenue: string;
  inventoryValue: string;
  realEstateIncluded: string;
  establishedYear: string;
  employees: string;
  reasonForSelling: string;
  summary: string;
  description: string;
  highlightsText: string;
  facilitiesOverview: string;
  growthOpportunities: string;
  supportAndTraining: string;
  imageUrl: string;
  galleryUrls: string[];
  status: 'PUBLISHED' | 'DRAFT';
  featured: boolean;
  isFavourite: boolean;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerNotes: string;
  sourceUrl: string;
}

const EMPTY_FORM: BusinessFormState = {
  title: '',
  category: 'Real Property Rltd',
  customCategory: '',
  location: 'Accra Metropolitan, Greater Accra Region',
  city: 'Accra',
  region: 'Greater Accra Region',
  currency: 'USD',
  askingPrice: '',
  downPayment: '',
  sellersDiscretionaryEarnings: '',
  grossRevenue: '',
  inventoryValue: '',
  realEstateIncluded: 'Real Property Included (Freehold / Titled)',
  establishedYear: '',
  employees: '',
  reasonForSelling: '',
  summary: '',
  description: '',
  highlightsText: '',
  facilitiesOverview: '',
  growthOpportunities: '',
  supportAndTraining: '',
  imageUrl: '',
  galleryUrls: [],
  status: 'PUBLISHED',
  featured: false,
  isFavourite: false,
  ownerName: '',
  ownerPhone: '',
  ownerEmail: '',
  ownerNotes: '',
  sourceUrl: '',
};

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessItem[]>(INITIAL_BUSINESSES_STORE);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // View / Modal state
  const [activeMode, setActiveMode] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
  const [form, setForm] = useState<BusinessFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<BusinessItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getAuthHeaders = (): Record<string, string> => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('loveridge_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchAdminBusinesses = useCallback(async (forceFresh = false) => {
    try {
      const qs = forceFresh ? `?refresh=true&_t=${Date.now()}` : `?_t=${Date.now()}`;
      const res = await fetch(`/api/admin/businesses${qs}`, {
        headers: getAuthHeaders(),
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.businesses)) {
          setBusinesses(data.businesses);
        }
      }
    } catch (err) {
      console.error('Error loading admin businesses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminBusinesses(false);
  }, [fetchAdminBusinesses]);

  useRealtimeSync((catalog) => {
    if (catalog === 'businesses') {
      fetchAdminBusinesses(true);
    }
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const openCreateForm = () => {
    setForm(EMPTY_FORM);
    setActiveMode('CREATE');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEditForm = (biz: BusinessItem) => {
    const isStandardCat = (BUSINESS_CATEGORIES as readonly string[]).includes(biz.category);
    setForm({
      id: biz.id,
      title: biz.title || '',
      category: isStandardCat ? biz.category : 'CUSTOM',
      customCategory: isStandardCat ? '' : biz.category || '',
      location: biz.location || '',
      city: biz.city || 'Accra',
      region: biz.region || 'Greater Accra Region',
      currency: (biz.currency as 'USD' | 'GHS' | 'EUR' | 'GBP') || 'USD',
      askingPrice:
        biz.askingPrice !== null && biz.askingPrice !== undefined
          ? String(biz.askingPrice)
          : '',
      downPayment:
        biz.downPayment !== null && biz.downPayment !== undefined
          ? String(biz.downPayment)
          : '',
      sellersDiscretionaryEarnings:
        biz.sellersDiscretionaryEarnings !== null &&
        biz.sellersDiscretionaryEarnings !== undefined
          ? String(biz.sellersDiscretionaryEarnings)
          : '',
      grossRevenue:
        biz.grossRevenue !== null && biz.grossRevenue !== undefined
          ? String(biz.grossRevenue)
          : '',
      inventoryValue:
        biz.inventoryValue !== null && biz.inventoryValue !== undefined
          ? String(biz.inventoryValue)
          : '',
      realEstateIncluded:
        typeof biz.realEstateIncluded === 'string'
          ? biz.realEstateIncluded
          : biz.realEstateIncluded
          ? 'Real Property Included (Freehold / Titled)'
          : 'Leasehold Assignment',
      establishedYear: biz.establishedYear || '',
      employees: biz.employees || '',
      reasonForSelling: biz.reasonForSelling || '',
      summary: biz.summary || '',
      description: biz.description || '',
      highlightsText: Array.isArray(biz.highlights) ? biz.highlights.join('\n') : '',
      facilitiesOverview: biz.facilitiesOverview || '',
      growthOpportunities: biz.growthOpportunities || '',
      supportAndTraining: biz.supportAndTraining || '',
      imageUrl: biz.imageUrl || '',
      galleryUrls: Array.isArray(biz.galleryUrls) ? biz.galleryUrls : [],
      status: (biz.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED') as 'PUBLISHED' | 'DRAFT',
      featured: Boolean(biz.featured),
      isFavourite: Boolean(biz.isFavourite),
      ownerName: biz.ownerName || '',
      ownerPhone: biz.ownerPhone || '',
      ownerEmail: biz.ownerEmail || '',
      ownerNotes: biz.ownerNotes || '',
      sourceUrl: biz.sourceUrl || '',
    });
    setActiveMode('EDIT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImages(true);

    try {
      const processedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const result = await optimizeImageToWebP(files[i], true);
        if (result?.dataUrl) {
          processedUrls.push(result.dataUrl);
        }
      }

      if (processedUrls.length > 0) {
        setForm((prev) => {
          const nextGallery = [...prev.galleryUrls, ...processedUrls];
          const nextCover = prev.imageUrl || nextGallery[0] || '';
          return {
            ...prev,
            imageUrl: nextCover,
            galleryUrls: nextGallery,
          };
        });
        showToast(
          'success',
          `${processedUrls.length} photo(s) optimized and watermarked.`
        );
      }
    } catch (err) {
      console.error('Image upload error:', err);
      showToast('error', 'Failed to process selected image(s).');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const removeGalleryImage = (urlToRemove: string) => {
    setForm((prev) => {
      const nextGallery = prev.galleryUrls.filter((u) => u !== urlToRemove);
      const nextCover =
        prev.imageUrl === urlToRemove ? nextGallery[0] || '' : prev.imageUrl;
      return {
        ...prev,
        imageUrl: nextCover,
        galleryUrls: nextGallery,
      };
    });
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('error', 'Please enter a Business Title.');
      return;
    }

    const resolvedCategory =
      form.category === 'CUSTOM'
        ? form.customCategory.trim() || 'Real Property Rltd'
        : form.category;

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        category: resolvedCategory,
        location:
          form.location.trim() || `${form.city.trim()}, ${form.region.trim()}`,
        city: form.city.trim() || 'Accra',
        region: form.region.trim() || 'Greater Accra Region',
        currency: form.currency,
        askingPrice: form.askingPrice,
        downPayment: form.downPayment,
        sellersDiscretionaryEarnings: form.sellersDiscretionaryEarnings,
        grossRevenue: form.grossRevenue,
        inventoryValue: form.inventoryValue,
        realEstateIncluded: form.realEstateIncluded.trim(),
        establishedYear: form.establishedYear.trim(),
        employees: form.employees.trim(),
        reasonForSelling: form.reasonForSelling.trim(),
        summary: form.summary.trim(),
        description: form.description.trim(),
        highlightsText: form.highlightsText,
        facilitiesOverview: form.facilitiesOverview.trim(),
        growthOpportunities: form.growthOpportunities.trim(),
        supportAndTraining: form.supportAndTraining.trim(),
        imageUrl: form.imageUrl.trim(),
        galleryUrls: form.galleryUrls,
        status: form.status,
        featured: form.featured,
        isFavourite: form.isFavourite,
        ownerName: form.ownerName.trim(),
        ownerPhone: form.ownerPhone.trim(),
        ownerEmail: form.ownerEmail.trim(),
        ownerNotes: form.ownerNotes.trim(),
        sourceUrl: form.sourceUrl.trim(),
      };

      const isEditing = activeMode === 'EDIT' && form.id;
      const endpoint = isEditing
        ? `/api/admin/businesses/${form.id}`
        : '/api/admin/businesses';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to save business listing');
      }

      showToast(
        'success',
        isEditing
          ? 'Business listing updated successfully!'
          : 'New business listing published!'
      );
      await fetchAdminBusinesses(true);
      setActiveMode('LIST');
    } catch (err: any) {
      showToast('error', err?.message || 'Error saving business listing');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (biz: BusinessItem) => {
    const nextStatus = biz.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await fetch(`/api/admin/businesses/${biz.id}/publish`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      showToast(
        'success',
        `"${biz.title}" is now ${nextStatus === 'PUBLISHED' ? 'LIVE' : 'set to Draft'}.`
      );
      await fetchAdminBusinesses(true);
    } catch (err: any) {
      showToast('error', err?.message || 'Could not toggle status');
    }
  };

  const handleToggleFeatured = async (biz: BusinessItem) => {
    const nextFeatured = !biz.featured;
    try {
      const res = await fetch(`/api/admin/businesses/${biz.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          featured: nextFeatured,
          isFavourite: nextFeatured,
        }),
      });
      if (!res.ok) throw new Error('Failed to update featured state');
      showToast(
        'success',
        nextFeatured
          ? `"${biz.title}" marked as Featured Opportunity.`
          : `"${biz.title}" removed from Featured.`
      );
      await fetchAdminBusinesses(true);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to update featured status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/businesses/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete business listing');
      showToast('success', `"${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      await fetchAdminBusinesses(true);
    } catch (err: any) {
      showToast('error', err?.message || 'Could not delete business');
    } finally {
      setDeleting(false);
    }
  };

  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return businesses.filter((b) => {
      if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
      if (
        categoryFilter !== 'ALL' &&
        b.category.toLowerCase() !== categoryFilter.toLowerCase()
      ) {
        return false;
      }
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        (b.ownerName || '').toLowerCase().includes(q)
      );
    });
  }, [businesses, searchQuery, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const total = businesses.length;
    const published = businesses.filter((b) => b.status === 'PUBLISHED').length;
    const drafts = total - published;
    const totalPortfolioUsd = businesses
      .filter((b) => (b.currency || 'USD') === 'USD')
      .reduce((acc, b) => acc + (Number(b.askingPrice) || 0), 0);
    return { total, published, drafts, totalPortfolioUsd };
  }, [businesses]);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Notification Toast */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-bold transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-950 text-white border-emerald-700'
              : 'bg-red-950 text-white border-red-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
            <Briefcase className="w-3.5 h-3.5" />
            Corporate Advisory &amp; Business Brokerage
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Business Listings Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create, edit, and publish operating businesses, hotels, and commercial turnkey assets on the public Businesses page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/businesses"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Live Page
          </Link>

          {activeMode === 'LIST' ? (
            <button
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              List New Business
            </button>
          ) : (
            <button
              onClick={() => setActiveMode('LIST')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
              Back to Listings
            </button>
          )}
        </div>
      </div>

      {/* KPI Summary Row */}
      {activeMode === 'LIST' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Listed Businesses
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.total}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">
              Published Live
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-900">
              {stats.published}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-1">
              Drafts / Private Hold
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.drafts}
            </span>
          </div>

          <div className="bg-[#f4f6ee] p-5 rounded-2xl border border-slate-900/15 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
              USD Portfolio Asking Value
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-950">
              {formatBusinessAmount(stats.totalPortfolioUsd, 'USD')}
            </span>
          </div>
        </div>
      )}

      {/* CREATE / EDIT FORM VIEW */}
      {activeMode !== 'LIST' && (
        <form
          onSubmit={handleSaveBusiness}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="p-6 sm:p-8 bg-[#f4f6ee] border-b border-slate-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 block mb-1">
                {activeMode === 'EDIT' ? 'Update Business Listing' : 'New Business Opportunity'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                {form.title || 'Enter Business Listing Details'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as 'PUBLISHED' | 'DRAFT' })
                }
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900"
              >
                <option value="PUBLISHED">Status: PUBLISHED (Live)</option>
                <option value="DRAFT">Status: DRAFT (Hidden)</option>
              </select>

              <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      featured: e.target.checked,
                      isFavourite: e.target.checked,
                    })
                  }
                  className="rounded text-emerald-800 focus:ring-emerald-600"
                />
                Featured Listing
              </label>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Section 1: Card Headline & Key Financial Summary (Matches Public Card Layout) */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  1. Card Headline &amp; Core Financial Summary
                </h3>
                <p className="text-xs text-slate-500">
                  These fields appear directly on the Businesses listing card (Category, Title, Location, Asking Price, Down Payment, and Sellers Discretionary Earnings).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business Category / Sector *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 font-medium"
                  >
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Custom Category...</option>
                  </select>
                </div>

                {form.category === 'CUSTOM' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Custom Category Label *
                    </label>
                    <input
                      type="text"
                      value={form.customCategory}
                      onChange={(e) =>
                        setForm({ ...form, customCategory: e.target.value })
                      }
                      placeholder="e.g. Real Property Rltd"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                )}

                <div className={form.category === 'CUSTOM' ? 'md:col-span-1' : 'md:col-span-2'}>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business Listing Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Elegant Boutique Hotel & Suites for Sale – Prime Location, Accra"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Accra Metropolitan, Greater Accra Region"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Accra"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Region
                  </label>
                  <input
                    type="text"
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    placeholder="Greater Accra Region"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={form.currency}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        currency: e.target.value as 'USD' | 'GHS' | 'EUR' | 'GBP',
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="GHS">GHS (GH₵)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Asking Price *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={form.askingPrice}
                    onChange={(e) => setForm({ ...form, askingPrice: e.target.value })}
                    placeholder="4300000"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Down Payment
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.downPayment}
                    onChange={(e) => setForm({ ...form, downPayment: e.target.value })}
                    placeholder="3300000"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sellers Discretionary Earnings (SDE)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.sellersDiscretionaryEarnings}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sellersDiscretionaryEarnings: e.target.value,
                      })
                    }
                    placeholder="238471"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold text-emerald-900"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Full Business Description & Highlights */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  2. Full Business Description &amp; Investment Highlights
                </h3>
                <p className="text-xs text-slate-500">
                  Displayed when a buyer clicks on the business card to read the complete business dossier.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Executive Summary (Short Overview Callout)
                </label>
                <textarea
                  rows={2}
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="Brief 1-2 sentence executive summary of the business opportunity..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Business Description *
                </label>
                <textarea
                  rows={8}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Write the full multi-paragraph business description, operational history, asset breakdown, market positioning, and acquisition terms..."
                  className="w-full px-3.5 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Key Investment &amp; Operational Highlights (One highlight per line)
                </label>
                <textarea
                  rows={5}
                  value={form.highlightsText}
                  onChange={(e) => setForm({ ...form, highlightsText: e.target.value })}
                  placeholder={`Prime freehold hospitality property in Accra Metropolitan\nTurnkey boutique hotel & executive suites with strong year-round corporate occupancy\nConsistent Sellers Discretionary Earnings (SDE) of $238,471`}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Section 3: Extended Financial, Property & Handover Details */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  3. Extended Operational, Facilities &amp; Handover Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Annual Gross Revenue
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.grossRevenue}
                    onChange={(e) => setForm({ ...form, grossRevenue: e.target.value })}
                    placeholder="e.g. 685000"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    FF&amp;E / Inventory Value
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.inventoryValue}
                    onChange={(e) => setForm({ ...form, inventoryValue: e.target.value })}
                    placeholder="e.g. 420000"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Year Established
                  </label>
                  <input
                    type="text"
                    value={form.establishedYear}
                    onChange={(e) =>
                      setForm({ ...form, establishedYear: e.target.value })
                    }
                    placeholder="e.g. 2018"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Employees / Staff
                  </label>
                  <input
                    type="text"
                    value={form.employees}
                    onChange={(e) => setForm({ ...form, employees: e.target.value })}
                    placeholder="e.g. 28 Full-Time Staff"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Real Property Status
                  </label>
                  <input
                    type="text"
                    value={form.realEstateIncluded}
                    onChange={(e) =>
                      setForm({ ...form, realEstateIncluded: e.target.value })
                    }
                    placeholder="Real Property Included (Freehold / Titled)"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reason for Selling
                  </label>
                  <input
                    type="text"
                    value={form.reasonForSelling}
                    onChange={(e) =>
                      setForm({ ...form, reasonForSelling: e.target.value })
                    }
                    placeholder="e.g. Owner capital reallocation & international retirement"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Facilities &amp; Real Estate Overview
                  </label>
                  <textarea
                    rows={3}
                    value={form.facilitiesOverview}
                    onChange={(e) =>
                      setForm({ ...form, facilitiesOverview: e.target.value })
                    }
                    placeholder="Describe the buildings, suites, acreage, equipment, and physical assets..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expansion &amp; Growth Potential
                  </label>
                  <textarea
                    rows={3}
                    value={form.growthOpportunities}
                    onChange={(e) =>
                      setForm({ ...form, growthOpportunities: e.target.value })
                    }
                    placeholder="Outline upside potential, new revenue streams, or expansion capacity..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Transition Support &amp; Training
                  </label>
                  <textarea
                    rows={3}
                    value={form.supportAndTraining}
                    onChange={(e) =>
                      setForm({ ...form, supportAndTraining: e.target.value })
                    }
                    placeholder="e.g. 90-day executive handover and management transition..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Optional Photos & Media */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  4. Business Photos &amp; Gallery (Optional)
                </h3>
                <p className="text-xs text-slate-500">
                  Leave empty for a clean confidential typographic card (matching the classic business brokerage style), or upload photos to showcase the property/business.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold cursor-pointer transition-colors">
                  {uploadingImages ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>
                    {uploadingImages ? 'Optimizing & Watermarking...' : 'Upload Business Photos'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImages}
                  />
                </label>

                {form.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imageUrl: '', galleryUrls: [] })}
                    className="text-xs font-bold text-red-600 hover:underline"
                  >
                    Clear All Photos (Use Clean Typographic Card)
                  </button>
                )}
              </div>

              {form.galleryUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                  {form.galleryUrls.map((url, idx) => {
                    const isCover = form.imageUrl === url;
                    return (
                      <div
                        key={idx}
                        className={`relative group rounded-xl overflow-hidden border-2 aspect-[4/3] bg-slate-100 ${
                          isCover ? 'border-emerald-700' : 'border-slate-200'
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, imageUrl: url })}
                            className="px-2 py-1 rounded bg-white text-slate-900 text-[10px] font-bold"
                          >
                            {isCover ? 'Cover' : 'Set Cover'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(url)}
                            className="p-1 rounded bg-red-600 text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        {isCover && (
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-emerald-900 text-white text-[9px] font-bold uppercase">
                            Cover
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 5: Confidential Internal Owner / Seller Record */}
            <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-800" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    5. Internal Seller / Owner Record (Admin-Only — Never Shown Publicly)
                  </h3>
                  <p className="text-xs text-slate-600">
                    Confidential seller contact details and sourcing notes for Loveridge administrators only.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Owner / Seller Name
                  </label>
                  <input
                    type="text"
                    value={form.ownerName}
                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                    placeholder="Confidential Owner Name"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Owner Phone Number
                  </label>
                  <input
                    type="text"
                    value={form.ownerPhone}
                    onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
                    placeholder="+233 ..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Owner Email
                  </label>
                  <input
                    type="email"
                    value={form.ownerEmail}
                    onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                    placeholder="owner@company.com"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Internal Sourcing / Commission Notes
                  </label>
                  <input
                    type="text"
                    value={form.ownerNotes}
                    onChange={(e) => setForm({ ...form, ownerNotes: e.target.value })}
                    placeholder="e.g. Direct mandate, 5% advisory retainer, NDA required..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reference / Source URL
                  </label>
                  <input
                    type="text"
                    value={form.sourceUrl}
                    onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveMode('LIST')}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Listing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {activeMode === 'EDIT'
                      ? 'Save Changes to Business Listing'
                      : 'Publish Business Listing'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* LIST VIEW */}
      {activeMode === 'LIST' && (
        <>
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, category, location, or owner..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    statusFilter === st
                      ? 'bg-emerald-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All Statuses' : st}
                </button>
              ))}

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 text-slate-800"
              >
                <option value="ALL">All Sectors</option>
                {BUSINESS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Listings Grid */}
          {loading && businesses.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-800 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">
                Loading Business Listings...
              </p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">
                No Business Listings Found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click &ldquo;List New Business&rdquo; above to add a new business opportunity to the portal.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {filteredList.map((biz) => {
                const currency = biz.currency || 'USD';
                return (
                  <div
                    key={biz.id}
                    className="rounded-2xl bg-[#f4f6ee] border border-slate-900/15 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-6 sm:p-7">
                      {/* Top Status & Sector Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="text-sm font-medium text-slate-900">
                          {biz.category || 'Real Property Rltd'}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(biz)}
                            title="Toggle Featured"
                            className={`p-1.5 rounded-lg border transition-colors ${
                              biz.featured
                                ? 'bg-amber-400/20 border-amber-500 text-amber-700'
                                : 'bg-white/70 border-slate-300 text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            <Star
                              className={`w-4 h-4 ${biz.featured ? 'fill-amber-500' : ''}`}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(biz)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-colors ${
                              biz.status === 'PUBLISHED'
                                ? 'bg-emerald-900 text-white'
                                : 'bg-amber-200 text-amber-950'
                            }`}
                          >
                            {biz.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'}
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl sm:text-2xl font-medium text-slate-950 leading-snug">
                        {biz.title}
                      </h2>

                      <hr className="border-t border-slate-900/70 my-5" />

                      {/* Key Metrics matching screenshot */}
                      <div className="space-y-2 text-sm sm:text-base text-slate-950">
                        <p>
                          <span className="font-normal text-slate-800">Location: </span>
                          <strong className="font-bold">{biz.location}</strong>
                        </p>
                        <p>
                          <span className="font-normal text-slate-800">
                            Asking Price:{' '}
                          </span>
                          <strong className="font-bold">
                            {formatBusinessAmount(biz.askingPrice, currency)}
                          </strong>
                        </p>
                        <p>
                          <span className="font-normal text-slate-800">
                            Down Payment:{' '}
                          </span>
                          <strong className="font-bold">
                            {biz.downPayment !== null && biz.downPayment !== undefined
                              ? formatBusinessAmount(biz.downPayment, currency)
                              : 'Upon Request'}
                          </strong>
                        </p>
                        <p>
                          <span className="font-normal text-slate-800">
                            Sellers Discretionary Earnings:{' '}
                          </span>
                          <strong className="font-bold">
                            {biz.sellersDiscretionaryEarnings !== null &&
                            biz.sellersDiscretionaryEarnings !== undefined
                              ? formatBusinessAmount(
                                  biz.sellersDiscretionaryEarnings,
                                  currency
                                )
                              : 'Disclosed Upon NDA'}
                          </strong>
                        </p>
                      </div>

                      {/* Description Preview */}
                      {biz.description && (
                        <p className="mt-4 text-xs text-slate-700 line-clamp-2 leading-relaxed bg-white/60 p-3 rounded-xl border border-slate-900/10">
                          {biz.description}
                        </p>
                      )}

                      {/* Internal Owner Badge (if present) */}
                      {(biz.ownerName || biz.ownerPhone || biz.ownerNotes) && (
                        <div className="mt-3 px-3 py-2 rounded-xl bg-amber-100/80 border border-amber-300/80 text-[11px] text-amber-950 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="font-extrabold uppercase tracking-wider">
                            Owner Record:
                          </span>
                          {biz.ownerName && <span>{biz.ownerName}</span>}
                          {biz.ownerPhone && <span>{biz.ownerPhone}</span>}
                          {biz.ownerNotes && (
                            <span className="text-amber-800 truncate max-w-xs">
                              ({biz.ownerNotes})
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Footer */}
                    <div className="px-6 py-3.5 bg-white/80 border-t border-slate-900/10 flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/businesses/${biz.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 hover:text-emerald-700"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Open Full Description
                      </Link>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(biz)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit Listing
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(biz)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Delete Business Listing?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Are you sure you want to permanently remove{' '}
              <strong className="text-slate-900">{deleteTarget.title}</strong> from
              the Businesses catalog?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
