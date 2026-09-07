'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, Globe, Tag, Image as ImageIcon, CheckCircle, Upload, Layers, X, Loader2, Clock, Search, RefreshCw, Link2, ExternalLink, Copy, Check, Zap, AlertTriangle, FolderPlus, ArrowUpRight, Star } from 'lucide-react';
import { compressImage, watermarkImage, optimizeImageToWebP, ImageOptimizationReport } from '@/lib/utils/imageCompressor';
import { INITIAL_PRODUCTS_STORE, INITIAL_CATEGORIES_STORE } from '@/lib/products-constants';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import ImageOptimizationModal from '@/components/ImageOptimizationModal';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>(INITIAL_PRODUCTS_STORE);
  const [categories, setCategories] = useState<any[]>(INITIAL_CATEGORIES_STORE);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  // Sub-Navigation Section: Products vs Categories
  const [storeSection, setStoreSection] = useState<'PRODUCTS' | 'CATEGORIES'>('PRODUCTS');
  const [categorySearch, setCategorySearch] = useState('');
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('all');

  // Category Creation Form State
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
  });

  // Category Modal State
  const [categoryModal, setCategoryModal] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    id?: string;
    name: string;
    slug: string;
    description: string;
    submitting: boolean;
    error: string;
  }>({
    isOpen: false,
    isEditing: false,
    name: '',
    slug: '',
    description: '',
    submitting: false,
    error: '',
  });

  // Form View State
  const [activeTab, setActiveTab] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
  const [editItem, setEditItem] = useState<any>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: 'cat-doors',
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
    status: 'PUBLISHED',
    featured: true,
    isFavourite: false,
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
        fetch('/api/categories', { cache: 'no-store' }),
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

      if (catData.categories && Array.isArray(catData.categories) && catData.categories.length > 0) {
        setCategories(catData.categories);
        if (!form.categoryId) {
          setForm((prev) => ({ ...prev, categoryId: catData.categories[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load products/categories:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Real-time synchronization across devices
  useRealtimeSync((type) => {
    if (type === 'products' || type === 'categories') {
      fetchProducts();
    }
  });

  function openAddCategoryModal() {
    setCategoryModal({
      isOpen: true,
      isEditing: false,
      name: '',
      slug: '',
      description: '',
      submitting: false,
      error: '',
    });
  }

  function openEditCategoryModal(cat: any) {
    setCategoryModal({
      isOpen: true,
      isEditing: true,
      id: cat.id,
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      submitting: false,
      error: '',
    });
  }

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryModal.name.trim()) {
      setCategoryModal((prev) => ({ ...prev, error: 'Category name is required.' }));
      return;
    }

    setCategoryModal((prev) => ({ ...prev, submitting: true, error: '' }));
    try {
      const token = localStorage.getItem('loveridge_token');
      const url = categoryModal.isEditing
        ? `/api/admin/categories/${categoryModal.id}`
        : '/api/admin/categories';
      const method = categoryModal.isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: categoryModal.name.trim(),
          slug: categoryModal.slug.trim() || undefined,
          description: categoryModal.description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save category.');
      }

      setMessage(`Category "${data.category.name}" saved successfully!`);
      setTimeout(() => setMessage(''), 4000);

      if (data.category?.id) {
        setForm((prev) => ({ ...prev, categoryId: data.category.id }));
      }

      setCategoryModal((prev) => ({ ...prev, isOpen: false, submitting: false }));
      await fetchProducts();
    } catch (err: any) {
      setCategoryModal((prev) => ({ ...prev, error: err.message, submitting: false }));
    }
  }

  async function handleDeleteCategory(cat: any) {
    const confirmMsg = cat.productCount > 0
      ? `Category "${cat.name}" currently has ${cat.productCount} product(s) linked to it. Are you sure you want to delete it?`
      : `Are you sure you want to delete category "${cat.name}"?`;
    if (!confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('loveridge_token');
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete category.');

      setMessage(`Category "${cat.name}" deleted successfully.`);
      setTimeout(() => setMessage(''), 4000);

      // If deleted category was selected in the form, reset it to another category
      setForm((prev) => {
        if (prev.categoryId === cat.id) {
          const fallback = categories.find((c) => c.id !== cat.id);
          return { ...prev, categoryId: fallback?.id || '' };
        }
        return prev;
      });

      await fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Error deleting category.');
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

  const filteredCategories = categories.filter((cat: any) => {
    if (!categorySearch.trim()) return true;
    const q = categorySearch.toLowerCase();
    return (
      cat.name?.toLowerCase().includes(q) ||
      cat.slug?.toLowerCase().includes(q) ||
      cat.description?.toLowerCase().includes(q)
    );
  });

  async function handleSave(e: React.FormEvent, targetStatus?: 'DRAFT' | 'PUBLISHED') {
    if (e) e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('loveridge_token');
    const url = editItem ? `/api/admin/products/${editItem.id}` : '/api/admin/products';
    const method = editItem ? 'PATCH' : 'POST';

    const chosenStatus = targetStatus || form.status || 'PUBLISHED';

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

  async function toggleFavourite(id: string, currentFav: boolean) {
    const token = localStorage.getItem('loveridge_token');
    const nextFav = !currentFav;
    if (nextFav) {
      const currentFavCount = products.filter((p) => p.isFavourite && p.id !== id).length;
      if (currentFavCount >= 3) {
        alert('Only 3 products can be selected as Favourite. Please deselect an existing Favourite product first.');
        return;
      }
    }
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isFavourite: nextFav, ...(nextFav ? { featured: true } : {}) }),
      });
      if (res.ok) {
        fetchProducts();
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.error) alert(data.error);
      }
    } catch (err) {
      console.error('Failed to toggle favourite status:', err);
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
      isFavourite: Boolean(prod.isFavourite || prod.favourite),
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
      status: 'PUBLISHED',
      featured: false,
      isFavourite: false,
      imageUrl: '',
      galleryUrls: [],
    });
    setCopiedLink(false);
    setGalleryInput('');
  }

  // Upload base64 WebP image to server disk and receive clean URL
  async function uploadBase64Image(base64: string): Promise<string> {
    if (!base64 || !base64.startsWith('data:')) return base64;
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64 }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        return data.url;
      }
    } catch (err) {
      console.warn('Upload API fallback note:', err);
    }
    return base64;
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
        setPendingCoverUrl(report.dataUrl);
        setShowOptimizationModal(true);
      } else {
        const cleanUrl = await uploadBase64Image(report.dataUrl);
        setForm((prev) => ({ ...prev, imageUrl: cleanUrl }));
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
        const uploadedUrls = await Promise.all(reports.map((r) => uploadBase64Image(r.dataUrl)));
        setForm((prev) => ({
          ...prev,
          galleryUrls: [...prev.galleryUrls, ...uploadedUrls],
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

  const handleConfirmAutoOptimization = async () => {
    setUploading(true);
    try {
      if (pendingCoverUrl) {
        const cleanCover = await uploadBase64Image(pendingCoverUrl);
        setForm((prev) => ({ ...prev, imageUrl: cleanCover }));
        setPendingCoverUrl(null);
      }
      if (pendingGalleryUrls) {
        const cleanGallery = await Promise.all(pendingGalleryUrls.map(uploadBase64Image));
        setForm((prev) => ({
          ...prev,
          galleryUrls: [...prev.galleryUrls, ...cleanGallery],
        }));
        setPendingGalleryUrls(null);
      }
    } finally {
      setUploading(false);
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

  const selectedCat = categories.find((c) => c.id === form.categoryId);

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
            <>
              <button
                onClick={openAddCategoryModal}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-emerald-800" /> + Add Category
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('CREATE');
                }}
                className="gradient-btn w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Store Product
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'LIST' && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setStoreSection('PRODUCTS')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              storeSection === 'PRODUCTS'
                ? 'bg-emerald-900 text-white shadow-md shadow-emerald-950/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Store Products ({products.length})</span>
          </button>
          <button
            onClick={() => setStoreSection('CATEGORIES')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              storeSection === 'CATEGORIES'
                ? 'bg-emerald-900 text-white shadow-md shadow-emerald-950/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories & Collections ({categories.length})</span>
          </button>
        </div>
      )}

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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_0.75fr] gap-4">
                {/* Catalogue Category */}
                <div className="sm:col-span-2 xl:col-span-1">
                  <div className="flex items-center justify-between mb-2 min-h-[20px]">
                    <label className="block text-xs font-bold text-slate-800 truncate" title="Catalogue Category">
                      Catalogue Category *
                    </label>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={openAddCategoryModal}
                        className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 hover:underline cursor-pointer"
                        title="Create a new category without leaving this form"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setManageCategoriesOpen(true)}
                        className="text-[11px] font-bold text-slate-600 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
                        title="Manage all categories"
                      >
                        <Layers className="w-3 h-3" /> Manage All
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <select
                      required
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                      className="admin-select min-w-0 flex-1 truncate font-semibold"
                    >
                      <option value="">Select Category...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={!selectedCat}
                        onClick={() => selectedCat && openEditCategoryModal(selectedCat)}
                        className={`h-12 w-9 sm:w-10 flex items-center justify-center rounded-xl border transition shadow-2xs ${
                          selectedCat
                            ? 'bg-white hover:bg-emerald-50 border-slate-300/80 hover:border-emerald-400 text-slate-600 hover:text-emerald-800 cursor-pointer active:scale-95'
                            : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed opacity-50'
                        }`}
                        title={selectedCat ? `Edit "${selectedCat.name}" category` : 'Select a category to edit'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={!selectedCat}
                        onClick={() => selectedCat && handleDeleteCategory(selectedCat)}
                        className={`h-12 w-9 sm:w-10 flex items-center justify-center rounded-xl border transition shadow-2xs ${
                          selectedCat
                            ? 'bg-white hover:bg-rose-50 border-slate-300/80 hover:border-rose-400 text-slate-600 hover:text-rose-600 cursor-pointer active:scale-95'
                            : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed opacity-50'
                        }`}
                        title={selectedCat ? `Delete "${selectedCat.name}" category` : 'Select a category to delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price in Cedis (GH₵) */}
                <div className="sm:col-span-1 xl:col-span-1">
                  <div className="flex items-center justify-between mb-2 min-h-[20px]">
                    <label className="block text-xs font-bold text-slate-800 truncate" title="Price in Cedis (GH₵)">
                      Price in Cedis (GH₵) *
                    </label>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 font-black px-1.5 py-0.5 rounded shrink-0">
                      GHS
                    </span>
                  </div>
                  <div className="flex rounded-xl border border-slate-300/80 overflow-hidden focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/15 bg-white shadow-xs transition h-12">
                    <span className="inline-flex items-center px-3 bg-slate-100 text-slate-700 font-black text-xs border-r border-slate-200 select-none shrink-0">
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
                      className="w-full bg-transparent px-3 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none h-full min-w-0"
                    />
                  </div>
                </div>

                {/* Price in Chinese Yuan (¥) */}
                <div className="sm:col-span-1 xl:col-span-1">
                  <div className="flex items-center justify-between mb-2 min-h-[20px]">
                    <label className="block text-xs font-bold text-slate-800 truncate" title="Price in Chinese Yuan (¥)">
                      Price in Yuan (¥) *
                    </label>
                    <span className="text-[10px] text-red-800 bg-red-100 font-black px-1.5 py-0.5 rounded shrink-0">
                      CNY / RMB
                    </span>
                  </div>
                  <div className="flex rounded-xl border border-slate-300/80 overflow-hidden focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-600/15 bg-white shadow-xs transition h-12">
                    <span className="inline-flex items-center px-3 bg-red-50 text-red-800 font-black text-xs border-r border-red-200 select-none shrink-0">
                      ¥ CNY
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={form.priceCny}
                      onChange={(e) => setForm({ ...form, priceCny: e.target.value })}
                      placeholder="68.00"
                      className="w-full bg-transparent px-3 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none h-full min-w-0"
                    />
                  </div>
                </div>

                {/* Unit Measure */}
                <div className="sm:col-span-2 xl:col-span-1">
                  <div className="flex items-center justify-between mb-2 min-h-[20px]">
                    <label className="block text-xs font-bold text-slate-800">Unit Measure</label>
                    <span className="text-[10px] text-slate-500 bg-slate-100 font-medium px-1.5 py-0.5 rounded shrink-0">
                      Optional
                    </span>
                  </div>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="e.g. per piece"
                    className="admin-input min-w-0"
                  />
                </div>
              </div>

              {/* Stock Quantity, Availability Status, Origin & MOQ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

              {/* ADMIN PRIORITY: FAVOURITE (APPEARS FIRST ON PRODUCTS PAGE & FRONT PAGE, MAX 3) */}
              <div className="p-5 bg-slate-50/90 rounded-2xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* [✓] Favourite */}
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div
                      onClick={() => {
                        if (!form.isFavourite) {
                          const currentFavCount = products.filter((p) => p.isFavourite && p.id !== editItem?.id).length;
                          if (currentFavCount >= 3) {
                            alert('Only 3 products can be selected as Favourite. Please deselect an existing Favourite first.');
                            return;
                          }
                        }
                        setForm({ ...form, isFavourite: !form.isFavourite });
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${form.isFavourite
                          ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600/20'
                          : 'bg-white border-2 border-slate-300 hover:border-slate-400'
                        }`}
                    >
                      {form.isFavourite && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <span
                      onClick={() => {
                        if (!form.isFavourite) {
                          const currentFavCount = products.filter((p) => p.isFavourite && p.id !== editItem?.id).length;
                          if (currentFavCount >= 3) {
                            alert('Only 3 products can be selected as Favourite. Please deselect an existing Favourite first.');
                            return;
                          }
                        }
                        setForm({ ...form, isFavourite: !form.isFavourite });
                      }}
                      className="text-sm font-bold text-slate-800 cursor-pointer flex items-center gap-2"
                    >
                      Favourite
                      {form.isFavourite && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                          Active
                        </span>
                      )}
                    </span>
                  </label>

                  <span className="text-xs font-medium text-slate-500">
                    {form.isFavourite
                      ? '✓ Appears first on products page and front page (Maximum 3 products)'
                      : 'Standard display order'}
                  </span>
                </div>
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
      ) : storeSection === 'CATEGORIES' ? (
        /* VIEW: CATEGORY MANAGEMENT TABLE */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search categories or slug..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 w-56 sm:w-72"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-bold">
                {filteredCategories.length} Categories ({categories.reduce((acc, c) => acc + (c.productCount || 0), 0)} Total Products)
              </span>
              <button
                onClick={openAddCategoryModal}
                className="gradient-btn px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Category
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase tracking-wider font-extrabold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Category Name & Slug</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-center">Linked Products</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                      No categories found matching &quot;{categorySearch}&quot;. Click &quot;Add Category&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/80 transition group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-slate-900 text-sm flex items-center gap-2">
                            {cat.name}
                          </span>
                          <span className="inline-block self-start font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            slug: {cat.slug}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600 font-medium max-w-md">
                        {cat.description || <span className="text-slate-400 italic">No description added</span>}
                      </td>

                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          (cat.productCount || 0) > 0
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          <Package className="w-3.5 h-3.5" />
                          {cat.productCount || 0} {cat.productCount === 1 ? 'Product' : 'Products'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEditCategoryModal(cat)}
                          className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition cursor-pointer"
                          title="Edit Category Name & Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200/80 transition cursor-pointer"
                          title="Delete Category"
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
                  <th className="px-6 py-4">Favourite</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium">
                      No products found matching &quot;{searchQuery}&quot;. Click &quot;Add Store Product&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition group">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                          <img
                            src={prod.imageUrl || '/product_tiles.png'}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 line-clamp-1">{prod.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {prod.sku}
                            </span>
                            {prod.referenceUrl && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(prod.referenceUrl);
                                    setCopiedRowId(prod.id);
                                    setTimeout(() => setCopiedRowId(null), 2000);
                                  }}
                                  className="text-[10px] font-bold text-slate-500 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-0.5 transition"
                                  title="Copy Supplier Link"
                                >
                                  {copiedRowId === prod.id ? <Check className="w-2.5 h-2.5 text-emerald-700" /> : <Copy className="w-2.5 h-2.5" />}
                                  {copiedRowId === prod.id ? 'Copied' : 'Link'}
                                </button>
                                <a
                                  href={prod.referenceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-slate-400 hover:text-emerald-800 transition"
                                  title="Open Supplier Link in New Tab"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600 font-semibold">{prod.category?.name || 'Store Item'}</td>

                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block">
                            GH₵{prod.price?.toLocaleString()}
                          </span>
                          {prod.priceCny ? (
                            <span className="text-[10px] font-bold text-amber-700 block">
                              ¥{prod.priceCny?.toLocaleString()} CNY
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400 block">
                              ¥{Math.round((prod.price || 0) * 0.47).toLocaleString()} CNY
                            </span>
                          )}
                        </div>
                      </td>

                      {/* FAVOURITE TOGGLE BUTTON COLUMN */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => toggleFavourite(prod.id, Boolean(prod.isFavourite))}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition border flex items-center gap-1.5 ${prod.isFavourite
                              ? 'bg-blue-100 text-blue-900 border-blue-300 hover:bg-blue-200 shadow-2xs'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 hover:text-slate-800'
                            }`}
                          title={prod.isFavourite ? 'Click to unmark as Favourite' : 'Click to set as Favourite'}
                        >
                          <Star className={`w-3.5 h-3.5 ${prod.isFavourite ? 'fill-blue-600 text-blue-600' : 'text-slate-400'}`} />
                          {prod.isFavourite ? 'Favourite' : 'Standard'}
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            prod.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              prod.status === 'PUBLISHED' ? 'bg-emerald-600' : 'bg-amber-600'
                            }`}
                          />
                          {prod.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            prod.stockStatus === 'OUT_OF_STOCK'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {prod.stockStatus === 'PRE_ORDER'
                            ? 'Pre-Order'
                            : prod.stockStatus === 'OUT_OF_STOCK'
                              ? 'Out of Stock'
                              : 'In Stock'}{' '}
                          <span className="text-[10px] opacity-80">({prod.stockQuantity})</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEdit(prod)}
                          className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition cursor-pointer"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200/80 transition cursor-pointer"
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

      {/* Manage All Categories Modal */}
      {manageCategoriesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative max-h-[85vh] flex flex-col">
            <button
              type="button"
              onClick={() => setManageCategoriesOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0 pr-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Manage Product Categories</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Edit names, URL slugs, descriptions, or delete categories.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  openAddCategoryModal();
                }}
                className="gradient-btn px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add New
              </button>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 pr-1 -mr-1">
              {categories.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No categories found. Click &quot;Add New&quot; to create one.
                </div>
              ) : (
                categories.map((cat) => {
                  const isSelected = form.categoryId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      className={`flex items-center justify-between py-3.5 px-3 rounded-2xl transition ${
                        isSelected ? 'bg-emerald-50/60 border border-emerald-200' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{cat.name}</span>
                          {isSelected && (
                            <span className="text-[10px] font-bold bg-emerald-800 text-white px-2 py-0.5 rounded-full">
                              Selected for Item
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                            slug: {cat.slug}
                          </span>
                          <span>•</span>
                          <span>{cat.productCount || 0} product(s)</span>
                        </div>
                        {cat.description && (
                          <p className="text-xs text-slate-500 line-clamp-1">{cat.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, categoryId: cat.id }));
                            setManageCategoriesOpen(false);
                          }}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                          title="Select this category for the product"
                        >
                          Select
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            openEditCategoryModal(cat);
                          }}
                          className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                          title={`Edit ${cat.name}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                          title={`Delete ${cat.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setManageCategoriesOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Creation / Edit Modal */}
      {categoryModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative">
            <button
              type="button"
              onClick={() => setCategoryModal((prev) => ({ ...prev, isOpen: false }))}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {categoryModal.isEditing ? 'Edit Product Category' : 'Create New Product Category'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {categoryModal.isEditing
                    ? 'Update category name, URL slug, or descriptive details.'
                    : 'Add a new product category that immediately syncs across the store.'}
                </p>
              </div>
            </div>

            {categoryModal.error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                {categoryModal.error}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryModal.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setCategoryModal((prev) => ({
                      ...prev,
                      name,
                      slug: prev.isEditing ? prev.slug : slugify(name),
                    }));
                  }}
                  placeholder="e.g. Smart Locks & Security / Solar Lighting"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-700 focus:bg-white transition shadow-2xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    URL Identifier Slug *
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Auto-generated or custom</span>
                </div>
                <input
                  type="text"
                  required
                  value={categoryModal.slug}
                  onChange={(e) =>
                    setCategoryModal((prev) => ({ ...prev, slug: slugify(e.target.value) }))
                  }
                  placeholder="e.g. smart-locks-and-security"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-700 focus:bg-white transition shadow-2xs"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Used for frontend filtering link (e.g. /products?category={categoryModal.slug || 'slug'})
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={categoryModal.description}
                  onChange={(e) =>
                    setCategoryModal((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Provide a brief summary of items categorized under this group..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium rounded-xl p-3 focus:outline-none focus:border-emerald-700 focus:bg-white transition shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCategoryModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categoryModal.submitting}
                  className="gradient-btn px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {categoryModal.submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving Category...
                    </>
                  ) : categoryModal.isEditing ? (
                    'Save Category Changes'
                  ) : (
                    'Create Category Now'
                  )}
                </button>
              </div>
            </form>
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
