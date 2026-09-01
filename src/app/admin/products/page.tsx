'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, Globe, Tag, Image as ImageIcon, CheckCircle, Upload, Layers, X, Loader2, Clock, Search, RefreshCw, Link2, ExternalLink, Copy, Check, Zap, AlertTriangle } from 'lucide-react';
import { compressImage, watermarkImage, optimizeImageToWebP, ImageOptimizationReport } from '@/lib/utils/imageCompressor';
import { INITIAL_PRODUCTS_STORE, INITIAL_CATEGORIES_STORE } from '@/lib/products-constants';
import ImageOptimizationModal from '@/components/ImageOptimizationModal';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>(INITIAL_PRODUCTS_STORE);
  const [categories, setCategories] = useState<any[]>(INITIAL_CATEGORIES_STORE);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  // Form View State
  const [activeTab, setActiveTab] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
  const [editItem, setEditItem] = useState<any>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: 'cat-1',
    sku: '',
    referenceUrl: '',
    price: '',
    priceCny: '',
    currency: 'GHS',
    unit: 'per piece',
    stockQuantity: '50',
    stockStatus: 'IN_STOCK',
    originCountry: 'China',
    moq: '1',
    status: 'DRAFT',
    featured: true,
    imageUrl: '',
    galleryUrls: [] as string[],
  });

  const [galleryInput, setGalleryInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);
  const [optimizationReports, setOptimizationReports] = useState<ImageOptimizationReport[]>([]);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [pendingCoverUrl, setPendingCoverUrl] = useState<string | null>(null);
  const [pendingGalleryUrls, setPendingGalleryUrls] = useState<string[] | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function fetchProducts() {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('loveridge_token');
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/categories'),
      ]);
      if (prodRes.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      if (prodData.products && Array.isArray(prodData.products) && prodData.products.length > 0) {
        setProducts(prodData.products);
      }

      const cats: any[] = [];
      (catData.categories || []).forEach((c: any) => {
        cats.push(c);
        if (c.children) cats.push(...c.children);
      });
      if (cats.length > 0) {
        setCategories(cats);
        if (!form.categoryId) {
          setForm((prev) => ({ ...prev, categoryId: cats[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((prod) => {
    const matchesStatus = statusFilter === 'ALL' || prod.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      prod.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  async function handleSave(e: React.FormEvent, targetStatus?: 'DRAFT' | 'PUBLISHED') {
    if (e) e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('loveridge_token');
    const url = editItem ? `/api/admin/products/${editItem.id}` : '/api/admin/products';
    const method = editItem ? 'PATCH' : 'POST';

    const chosenStatus = targetStatus || form.status || 'DRAFT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          status: chosenStatus,
          galleryUrls: form.galleryUrls,
        }),
      });

      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (!res.ok) throw new Error(data.error || `Server error status: ${res.status}`);

      setMessage(
        editItem
          ? chosenStatus === 'DRAFT'
            ? 'Store product updated & saved as Draft!'
            : 'Store product updated & published successfully!'
          : chosenStatus === 'DRAFT'
            ? 'Store product saved as Draft successfully!'
            : 'Store product created & published successfully!'
      );
      setTimeout(() => setMessage(''), 4000);
      resetForm();
      setActiveTab('LIST');
      fetchProducts();
    } catch (err: any) {
      console.warn('Product publish incomplete, executing auto-save as DRAFT fallback:', err);

      // AUTO-SAVE AS DRAFT FALLBACK when listing or uploading couldn't complete fully
      try {
        const draftRes = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            status: 'DRAFT',
            name: form.name || 'Untitled Store Item (Draft)',
            description: form.description || 'Store item draft created automatically.',
            price: form.price ? parseFloat(form.price) : 0,
            galleryUrls: err.message?.includes('payload size') ? [] : form.galleryUrls,
          }),
        });

        if (draftRes.ok) {
          setMessage(`⚠️ Upload couldn't complete fully (${err.message}). Automatically saved as a DRAFT so you can publish it later!`);
          setTimeout(() => setMessage(''), 6000);
          resetForm();
          setActiveTab('LIST');
          fetchProducts();
          return;
        }
      } catch (draftErr) {
        console.error('Product draft fallback error:', draftErr);
      }

      // Local storage backup if API endpoint is completely unreachable
      const localDrafts = JSON.parse(localStorage.getItem('loveridge_product_drafts') || '[]');
      localDrafts.unshift({
        ...form,
        id: 'draft-prod-' + Date.now(),
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('loveridge_product_drafts', JSON.stringify(localDrafts));

      setMessage(`⚠️ Submission incomplete (${err.message}). Saved locally as a DRAFT so you can edit & publish later.`);
      setTimeout(() => setMessage(''), 6000);
      resetForm();
      setActiveTab('LIST');
      fetchProducts();
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleProductStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const token = localStorage.getItem('loveridge_token');
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error('Failed to toggle product status:', err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product from store inventory catalogue?')) return;
    const token = localStorage.getItem('loveridge_token');
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleFeatured(id: string, currentFeatured: boolean) {
    const token = localStorage.getItem('loveridge_token');
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ featured: !currentFeatured }),
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Failed to toggle featured status:', err);
    }
  }

  function openEdit(prod: any) {
    setEditItem(prod);
    setForm({
      name: prod.name,
      description: prod.description,
      categoryId: prod.categoryId,
      sku: prod.sku || 'SKU-' + Math.floor(100000 + Math.random() * 900000),
      referenceUrl: prod.referenceUrl || '',
      price: prod.price?.toString() || '',
      priceCny: prod.priceCny ? prod.priceCny.toString() : (prod.price ? (prod.price * 0.47).toFixed(2) : ''),
      currency: prod.currency || 'GHS',
      unit: prod.unit,
      stockQuantity: prod.stockQuantity.toString(),
      stockStatus: prod.stockStatus,
      originCountry: prod.originCountry,
      moq: prod.moq.toString(),
      status: prod.status,
      featured: prod.featured ?? false,
      imageUrl: prod.imageUrl || '',
      galleryUrls: Array.isArray(prod.galleryUrls) ? prod.galleryUrls : [],
    });
    setCopiedLink(false);
    setActiveTab('EDIT');
  }

  function resetForm() {
    setEditItem(null);
    setForm({
      name: '',
      description: '',
      categoryId: categories[0]?.id || '',
      sku: 'SKU-' + Math.floor(100000 + Math.random() * 900000),
      referenceUrl: '',
      price: '',
      priceCny: '',
      currency: 'GHS',
      unit: 'per piece',
      stockQuantity: '50',
      stockStatus: 'IN_STOCK',
      originCountry: 'China',
      moq: '1',
      status: 'DRAFT',
      featured: false,
      imageUrl: '',
      galleryUrls: [],
    });
    setCopiedLink(false);
    setGalleryInput('');
  }

  // Cover Image File Upload Handler (Calculates size and opens popup if above 300KB standard)
  async function handleCoverFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const report = await optimizeImageToWebP(file, true);
      setOptimizationReports([report]);
      if (report.isAboveStandard) {
        // File exceeded 300KB: open calculation warning popup and allow manual reupload or auto-reduce
        setPendingCoverUrl(report.dataUrl);
        setShowOptimizationModal(true);
      } else {
        // File meets the standard, apply directly
        setForm((prev) => ({ ...prev, imageUrl: report.dataUrl }));
      }
    } catch (err) {
      console.error('Failed to process cover image:', err);
      alert('Failed to process image file.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  // Gallery File Upload Handler (Calculates sizes and opens popup if any file is above 300KB)
  async function handleGalleryFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const reports = await Promise.all(
        Array.from(files).map((file) => optimizeImageToWebP(file, true))
      );
      setOptimizationReports(reports);
      const hasOversized = reports.some((r) => r.isAboveStandard);
      if (hasOversized) {
        setPendingGalleryUrls(reports.map((r) => r.dataUrl));
        setShowOptimizationModal(true);
      } else {
        setForm((prev) => ({
          ...prev,
          galleryUrls: [...prev.galleryUrls, ...reports.map((r) => r.dataUrl)],
        }));
      }
    } catch (err) {
      console.error('Failed to process gallery images:', err);
      alert('Failed to process gallery images.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  const handleConfirmAutoOptimization = () => {
    if (pendingCoverUrl) {
      setForm((prev) => ({ ...prev, imageUrl: pendingCoverUrl }));
      setPendingCoverUrl(null);
    }
    if (pendingGalleryUrls) {
      setForm((prev) => ({
        ...prev,
        galleryUrls: [...prev.galleryUrls, ...pendingGalleryUrls],
      }));
      setPendingGalleryUrls(null);
    }
  };

  async function addGalleryUrl() {
    if (!galleryInput.trim()) return;
    const url = galleryInput.trim();
    setGalleryInput('');
    try {
      const watermarked = await watermarkImage(url, 1200, 1200, 0.8);
      setForm((prev) => ({
        ...prev,
        galleryUrls: [...prev.galleryUrls, watermarked],
      }));
    } catch {
      setForm((prev) => ({
        ...prev,
        galleryUrls: [...prev.galleryUrls, url],
      }));
    }
  }

  function removeGalleryUrl(index: number) {
    setForm((prev) => ({
      ...prev,
      galleryUrls: prev.galleryUrls.filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Store Catalogue & Inventory Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage store product items, set product cover images, multi-image gallery photos, pricing & stock.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeTab !== 'LIST' ? (
            <button
              onClick={() => {
                resetForm();
                setActiveTab('LIST');
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition text-center"
            >
              ← Back to Inventory Table
            </button>
          ) : (
            <button
              onClick={() => {
                resetForm();
                setActiveTab('CREATE');
              }}
              className="gradient-btn w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Store Product
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          {message}
        </div>
      )}

      {/* VIEW: STORE ITEM FORM (SPACIOUS CARD LAYOUT MATCHING USER REQUIREMENTS) */}
      {activeTab !== 'LIST' ? (
        <div className="space-y-8 max-w-5xl mx-auto py-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-4 sm:p-8 lg:p-10 space-y-8">
            <div className="border-b border-slate-100 pb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {editItem ? 'Edit Store Product Details' : 'Store Product Listing Details'}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Specify product item details, pricing, MOQ, cover image, and multi-photo product gallery.
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Name & Reference Link */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Product Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. 60x120 High-Gloss Italian Porcelain Tiles / 20V Cordless Hammer Drill"
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Product Reference Link (Supplier / Source URL)
                  </label>
                  <div className="flex rounded-xl border border-slate-300/80 overflow-hidden focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/15 bg-white shadow-xs transition h-12">
                    <span className="inline-flex items-center px-3 bg-slate-100 text-slate-600 font-bold text-xs border-r border-slate-200 select-none shrink-0">
                      <Link2 className="w-3.5 h-3.5 text-slate-500 mr-1" /> URL
                    </span>
                    <input
                      type="url"
                      value={form.referenceUrl}
                      onChange={(e) => setForm({ ...form, referenceUrl: e.target.value })}
                      placeholder="Paste 1688, Alibaba, Taobao, or factory supplier link..."
                      className="w-full bg-transparent px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none h-full"
                    />
                    {form.referenceUrl && (
                      <div className="flex items-center pr-2 gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(form.referenceUrl);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          }}
                          className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg border border-slate-200 flex items-center gap-1 transition"
                          title="Copy Link to Clipboard"
                        >
                          {copiedLink ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                          {copiedLink ? 'Copied' : 'Copy'}
                        </button>
                        <a
                          href={form.referenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-500 hover:text-emerald-800 rounded-lg hover:bg-slate-100 transition"
                          title="Open Link in New Tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Category, Ghana Cedis Price, Chinese Yuan Price & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Catalogue Category *</label>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="admin-select"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                    <span>Price in Cedis (GH₵) *</span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 font-black px-1.5 py-0.5 rounded">
                      GHS
                    </span>
                  </label>
                  <div className="flex rounded-xl border border-slate-300/80 overflow-hidden focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/15 bg-white shadow-xs transition h-12">
                    <span className="inline-flex items-center px-3.5 bg-slate-100 text-slate-700 font-black text-xs border-r border-slate-200 select-none shrink-0">
                      GH₵
                    </span>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={form.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        const num = parseFloat(val);
                        setForm((prev) => ({
                          ...prev,
                          price: val,
                          priceCny: !prev.priceCny || isNaN(num) ? (isNaN(num) ? '' : (num * 0.47).toFixed(2)) : prev.priceCny,
                        }));
                      }}
                      placeholder="145.00"
                      className="w-full bg-transparent px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none h-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                    <span>Price in Chinese Yuan (¥) *</span>
                    <span className="text-[10px] text-red-800 bg-red-100 font-black px-1.5 py-0.5 rounded">
                      CNY / RMB
                    </span>
                  </label>
                  <div className="flex rounded-xl border border-slate-300/80 overflow-hidden focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-600/15 bg-white shadow-xs transition h-12">
                    <span className="inline-flex items-center px-3.5 bg-red-50 text-red-800 font-black text-xs border-r border-red-200 select-none shrink-0">
                      ¥ CNY
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={form.priceCny}
                      onChange={(e) => setForm({ ...form, priceCny: e.target.value })}
                      placeholder="68.00"
                      className="w-full bg-transparent px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none h-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Unit Measure</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="e.g. per box, per set, per piece"
                    className="admin-input"
                  />
                </div>
              </div>

              {/* Stock Quantity, Availability Status, Origin & MOQ */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Availability Status *</label>
                  <select
                    value={form.stockStatus}
                    onChange={(e) => setForm({ ...form, stockStatus: e.target.value })}
                    className="admin-select"
                  >
                    <option value="IN_STOCK">In Stock (Available Now)</option>
                    <option value="PRE_ORDER">Available on Pre-Order</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Country of Origin</label>
                  <input
                    type="text"
                    value={form.originCountry}
                    onChange={(e) => setForm({ ...form, originCountry: e.target.value })}
                    placeholder="e.g. Italy, China, Germany"
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Min Order Qty (MOQ)</label>
                  <input
                    type="number"
                    value={form.moq}
                    onChange={(e) => setForm({ ...form, moq: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              {/* PRODUCT COVER IMAGE & MULTI-IMAGE GALLERY UPLOADER SECTION */}
              <div className="p-6 bg-slate-50/80 rounded-3xl border border-slate-200 space-y-6">
                <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-emerald-700" /> Product Cover Photo & Multi-Image Gallery
                      </h3>
                      <span className="text-[10px] text-emerald-900 bg-emerald-100/90 border border-emerald-300 font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                        <Zap className="w-3 h-3 text-emerald-700" /> 200–300KB WebP Standard
                      </span>
                      <span className="text-[10px] text-slate-700 bg-white border border-slate-200 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                        🛡️ Watermark Stamped
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                      Files are automatically converted to high-speed <strong>WebP (200KB–300KB limit)</strong> and watermarked with Loveridge official signature.
                    </p>
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-8 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">1. Product Main Cover Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.imageUrl}
                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                        placeholder="Paste Product Cover Image URL or choose file..."
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-emerald-700"
                      />
                      <label className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm">
                        <Upload className="w-3.5 h-3.5 text-emerald-400" /> Upload File
                        <input type="file" accept="image/*" onChange={handleCoverFileUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* Cover Image Preview */}
                  <div className="md:col-span-4 flex justify-center">
                    <div className="w-full h-32 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-2 relative shadow-inner">
                      {form.imageUrl ? (
                        <img src={form.imageUrl} alt="Cover Preview" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="text-center text-slate-400 space-y-1">
                          <ImageIcon className="w-6 h-6 mx-auto opacity-40" />
                          <span className="text-[10px] block font-semibold">No Cover Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gallery Images Upload */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      2. Product Multi-Image Gallery ({form.galleryUrls.length} Photos Added)
                    </label>
                    <label className="bg-emerald-800 hover:bg-emerald-900 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm">
                      <Upload className="w-3.5 h-3.5" /> Upload Gallery Files
                      <input type="file" accept="image/*" multiple onChange={handleGalleryFileUpload} className="hidden" />
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={galleryInput}
                      onChange={(e) => setGalleryInput(e.target.value)}
                      placeholder="Paste Image URL to add to product gallery..."
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:border-emerald-700"
                    />
                    <button
                      type="button"
                      onClick={addGalleryUrl}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      Add URL
                    </button>
                  </div>

                  {/* Gallery Thumbnails Grid */}
                  {form.galleryUrls.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                      {form.galleryUrls.map((url, idx) => (
                        <div key={idx} className="relative group h-24 rounded-xl border border-slate-200 bg-white p-1 overflow-hidden shadow-xs flex items-center justify-center">
                          <img src={url} alt={`Gallery ${idx}`} className="max-h-full max-w-full object-contain" />
                          <button
                            type="button"
                            onClick={() => removeGalleryUrl(idx)}
                            className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-80 hover:opacity-100 shadow-md"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* FEATURED PRODUCT TOGGLE SWITCH */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <label htmlFor="featured-toggle" className="text-xs font-bold text-slate-900 cursor-pointer block">
                    Featured Product
                  </label>
                  <p className="text-[11px] text-slate-600 font-medium">
                    When checked, this item will appear in the Featured Store section on the home page.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="featured-toggle"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-5 h-5 text-emerald-800 rounded border-slate-300 focus:ring-emerald-800 cursor-pointer shrink-0"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">Product Overview & Technical Specs *</label>
                <textarea
                  rows={4}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Provide technical specifications, material grade, dimensions, wear rating, or battery voltage."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:border-emerald-700 focus:bg-white"
                />
              </div>

              {/* Submit Buttons: Save Draft vs Publish */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab('LIST');
                  }}
                  className="py-3.5 px-5 rounded-2xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSave(e, 'DRAFT')}
                  disabled={submitting || uploading}
                  className="py-3.5 px-6 rounded-2xl border-2 border-amber-600 text-amber-800 hover:bg-amber-50 text-xs font-extrabold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSave(e, 'PUBLISHED')}
                  disabled={submitting || uploading}
                  className="gradient-btn flex-1 py-3.5 rounded-2xl text-xs font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Product...
                    </>
                  ) : uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Optimizing Images...
                    </>
                  ) : editItem ? (
                    'Publish Product Updates'
                  ) : (
                    'Publish Store Product Now'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* VIEW: STORE INVENTORY TABLE */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 w-48 sm:w-64"
                />
              </div>

              <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl text-[11px] font-bold">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1 rounded-lg transition ${statusFilter === 'ALL' ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-600 hover:text-slate-950'}`}
                >
                  All ({products.length})
                </button>
                <button
                  onClick={() => setStatusFilter('PUBLISHED')}
                  className={`px-3 py-1 rounded-lg transition ${statusFilter === 'PUBLISHED' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-950'}`}
                >
                  Published
                </button>
                <button
                  onClick={() => setStatusFilter('DRAFT')}
                  className={`px-3 py-1 rounded-lg transition ${statusFilter === 'DRAFT' ? 'bg-white text-amber-800 shadow-2xs' : 'text-slate-600 hover:text-slate-950'}`}
                >
                  Drafts
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {refreshing && (
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
                </span>
              )}
              <span className="text-xs text-slate-500 font-bold">{filteredProducts.length} Items Listed</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase tracking-wider font-extrabold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Item Cover</th>
                  <th className="px-6 py-4">Product & SKU</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Unit Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Featured</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 font-semibold">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shadow-2xs">
                          <img
                            src={
                              prod.imageUrl ||
                              (prod.slug.includes('drill')
                                ? '/product_drill.png'
                                : prod.slug.includes('lock')
                                  ? '/product_lock.png'
                                  : '/product_tiles.png')
                            }
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 max-w-xs">
                        <div className="text-sm text-slate-900 line-clamp-1">{prod.name}</div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] font-mono text-slate-400">SKU: {prod.sku}</span>
                          {prod.referenceUrl ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(prod.referenceUrl);
                                  setCopiedRowId(prod.id);
                                  setTimeout(() => setCopiedRowId(null), 2000);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition"
                                title={`Copy supplier link: ${prod.referenceUrl}`}
                              >
                                {copiedRowId === prod.id ? (
                                  <>
                                    <Check className="w-2.5 h-2.5 text-emerald-700" /> Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-2.5 h-2.5" /> Copy Ref Link
                                  </>
                                )}
                              </button>
                              <a
                                href={prod.referenceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-slate-400 hover:text-emerald-700 transition"
                                title="Open Supplier Link in New Tab"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No ref link</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-semibold">{prod.category?.name || 'Store Item'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-extrabold text-slate-900 text-sm">
                          GH₵ {Number(prod.price).toLocaleString()}
                        </div>
                        <div className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-md inline-block mt-0.5">
                          ¥ {Number(prod.priceCny || Math.round(prod.price * 0.47)).toLocaleString()} CNY
                        </div>
                      </td>

                      {/* STATUS TOGGLE BUTTON COLUMN */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase border flex items-center gap-1.5 shadow-2xs ${prod.status === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                              }`}
                          >
                            {prod.status === 'PUBLISHED' ? (
                              <>
                                <CheckCircle className="w-3 h-3 text-emerald-600" /> PUBLISHED
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-700" /> DRAFT
                              </>
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleProductStatus(prod.id, prod.status || 'DRAFT')}
                            className="text-[10px] font-extrabold text-slate-500 hover:text-emerald-800 underline transition pt-0.5"
                          >
                            {prod.status === 'PUBLISHED' ? 'Unpublish to Draft' : '⚡ Publish Now'}
                          </button>
                        </div>
                      </td>

                      {/* FEATURED TOGGLE BUTTON COLUMN */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => toggleFeatured(prod.id, prod.featured)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition border ${prod.featured
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 hover:text-slate-800'
                            }`}
                          title={prod.featured ? 'Click to unmark as Featured' : 'Click to mark as Featured'}
                        >
                          {prod.featured ? 'Featured' : 'Standard'}
                        </button>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full border inline-block ${prod.stockStatus === 'PRE_ORDER' || prod.stockStatus === 'PREORDER'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : prod.stockStatus === 'OUT_OF_STOCK'
                                ? 'bg-rose-100 text-rose-900 border-rose-300'
                                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            }`}
                        >
                          {prod.stockStatus === 'PRE_ORDER' || prod.stockStatus === 'PREORDER'
                            ? 'Available on Pre-Order'
                            : prod.stockStatus === 'OUT_OF_STOCK'
                              ? 'Out of Stock'
                              : 'In Stock'}{' '}
                          <span className="text-[10px] opacity-80">({prod.stockQuantity})</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEdit(prod)}
                          className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200/80 transition"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fast-Load WebP Image Optimization Report & Popup Modal */}
      <ImageOptimizationModal
        isOpen={showOptimizationModal}
        onClose={() => {
          setShowOptimizationModal(false);
          setPendingCoverUrl(null);
          setPendingGalleryUrls(null);
        }}
        onAutoOptimizeConfirm={handleConfirmAutoOptimization}
        reports={optimizationReports}
        title="Image Size Exceeded Fast-Load Standard"
      />
    </div>
  );
}
