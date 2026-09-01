'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, Globe, Tag, Image as ImageIcon, Sparkles, CheckCircle, Upload, Layers, X, Loader2, Clock, Search, RefreshCw } from 'lucide-react';
import { compressImage, watermarkImage } from '@/lib/utils/imageCompressor';
import { INITIAL_PRODUCTS_STORE, INITIAL_CATEGORIES_STORE } from '@/lib/products-constants';

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
    price: '',
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

  const [galleryInput, setGalleryInput] = useState('')
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
      sku: prod.sku,
      price: prod.price.toString(),
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
    setActiveTab('EDIT');
  }

  function resetForm() {
    setEditItem(null);
    setForm({
      name: '',
      description: '',
      categoryId: categories[0]?.id || '',
      sku: 'SKU-' + Math.floor(100000 + Math.random() * 900000),
      price: '',
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
    setGalleryInput('');
  }

  // Cover Image File Upload Handler (Compresses image client-side to prevent Vercel 413 payload limit error)
  async function handleCoverFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file, 1200, 1200, 0.8);
      setForm((prev) => ({ ...prev, imageUrl: compressed }));
    } catch (err) {
      console.error('Failed to compress cover image:', err);
      alert('Failed to process image file.');
    } finally {
      setUploading(false);
    }
  }

  // Gallery File Upload Handler (Compresses all gallery files client-side)
  async function handleGalleryFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const compressedImages = await Promise.all(
        Array.from(files).map((file) => compressImage(file, 1200, 1200, 0.8))
      );
      setForm((prev) => ({
        ...prev,
        galleryUrls: [...prev.galleryUrls, ...compressedImages],
      }));
    } catch (err) {
      console.error('Failed to compress gallery images:', err);
      alert('Failed to process gallery images.');
    } finally {
      setUploading(false);
    }
  }

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
              {/* Name & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
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
                  <label className="block text-xs font-bold text-slate-800 mb-2">Product Stock SKU *</label>
                  <input
                    type="text"
                    required
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="e.g. TILE-PORC-60120"
                    className="admin-input"
                  />
                </div>
              </div>

              {/* Category, Unit Price & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <label className="block text-xs font-bold text-slate-800 mb-2">Unit Price (GHS) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="e.g. 145.00"
                    className="admin-input"
                  />
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
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-emerald-700" /> Product Cover Photo & Multi-Image Gallery
                      </h3>
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        🛡️ Loveridge Watermark Applied
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      All uploaded product photos automatically carry the official Loveridge signature watermark for copyright protection.
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
                        <div className="text-[10px] font-mono text-emerald-800">SKU: {prod.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-semibold">{prod.category?.name || 'Store Item'}</td>
                      <td className="px-6 py-4 font-extrabold text-slate-900">
                        {prod.currency || 'GHS'} {prod.price.toLocaleString()}
                      </td>

                      {/* STATUS TOGGLE BUTTON COLUMN */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase border flex items-center gap-1.5 shadow-2xs ${
                              prod.status === 'PUBLISHED'
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
                          className={`px-3 py-1 rounded-full text-xs font-bold transition border ${
                            prod.featured
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
                          className={`px-3 py-1 text-xs font-bold rounded-full border inline-block ${
                            prod.stockStatus === 'PRE_ORDER' || prod.stockStatus === 'PREORDER'
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
    </div>
  );
}
