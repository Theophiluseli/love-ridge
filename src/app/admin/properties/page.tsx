'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Search, ShieldCheck, Eye, Image as ImageIcon, Trees, Warehouse, Building, Building2, Upload, ArrowRight, X, Sparkles, Phone, Mail, User, Loader2, Clock } from 'lucide-react';
import Link from 'next/link';
import { compressImage } from '@/lib/utils/imageCompressor';

const DEFAULT_AGENTS = [
  'Desmond Senanu',
  'Kwame Appiah',
  'Sarah Osei',
  'Loveridge Staff Agent',
];

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form View State
  const [activeTab, setActiveTab] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
  const [editItem, setEditItem] = useState<any>(null);

  // Agent Selection Dropdown & Custom Input State
  const [agentSelectMode, setAgentSelectMode] = useState<string>('Kwame Appiah');
  const [customAgentInput, setCustomAgentInput] = useState<string>('');

  // Form state matching screenshot layout
  const [form, setForm] = useState({
    title: '',
    description: '',
    listingType: 'RENT', // RENT, SALE
    propertyType: 'LAND', // LAND, OFFICE_SPACE, WAREHOUSE, HOUSE, APARTMENT
    price: '',
    currency: 'USD',
    pricePeriod: 'per month',
    bedrooms: '0',
    bathrooms: '0',
    guestRooms: '0',
    boysQuarters: '0',
    garage: '0',
    sizeSqft: '',
    livingAreaSqft: '',
    locationAddress: '',
    city: 'Accra',
    region: 'Greater Accra',
    featured: true,
    status: 'DRAFT',
    imageUrl: '',
    galleryUrls: [] as string[],
    contactName: 'Kwame Appiah',
    contactPhone: '+233 24 000 1111',
    contactEmail: 'agent@loveridge.com',
  });

  const [galleryInput, setGalleryInput] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function fetchProperties() {
    setLoading(true);
    try {
      const token = localStorage.getItem('loveridge_token');
      const res = await fetch('/api/admin/properties', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err) {
      console.error('Failed to load admin properties:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProperties();
  }, []);

  async function handleSave(e: React.FormEvent, targetStatus?: 'DRAFT' | 'PUBLISHED') {
    if (e) e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('loveridge_token');
    const url = editItem ? `/api/admin/properties/${editItem.id}` : '/api/admin/properties';
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

      if (!res.ok) {
        if (res.status === 401) {
          alert('Your session token has expired or is invalid. Redirecting to admin login...');
          window.location.href = '/admin/login';
          return;
        }
        throw new Error(data.error || `Server response status: ${res.status}`);
      }

      setMessage(
        editItem
          ? chosenStatus === 'DRAFT'
            ? 'Property updated & saved as Draft!'
            : 'Property updated & published successfully!'
          : chosenStatus === 'DRAFT'
          ? 'Property saved as Draft successfully!'
          : 'Property created & published successfully!'
      );
      setTimeout(() => setMessage(''), 4000);
      resetForm();
      setActiveTab('LIST');
      fetchProperties();
    } catch (err: any) {
      console.warn('Publish attempt incomplete, performing auto-save as DRAFT fallback:', err);
      
      // AUTO-SAVE AS DRAFT FALLBACK when listing/uploading fails or is incomplete
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
            title: form.title || 'Untitled Property Listing (Draft)',
            description: form.description || 'Property listing draft saved automatically.',
            price: form.price ? parseFloat(form.price) : 0,
            locationAddress: form.locationAddress || 'Pending Location',
            city: form.city || 'Accra',
            galleryUrls: err.message?.includes('payload size') ? [] : form.galleryUrls,
          }),
        });

        if (draftRes.ok) {
          setMessage(`⚠️ Upload couldn't complete fully (${err.message}). Automatically saved as a DRAFT so you can publish it later!`);
          setTimeout(() => setMessage(''), 6000);
          resetForm();
          setActiveTab('LIST');
          fetchProperties();
          return;
        }
      } catch (draftErr) {
        console.error('Draft fallback network error:', draftErr);
      }

      // Local storage backup if API endpoint is completely unreachable
      const localDrafts = JSON.parse(localStorage.getItem('loveridge_property_drafts') || '[]');
      localDrafts.unshift({
        ...form,
        id: 'draft-' + Date.now(),
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('loveridge_property_drafts', JSON.stringify(localDrafts));

      setMessage(`⚠️ Submission incomplete (${err.message}). Saved locally as a DRAFT so you can edit & publish later.`);
      setTimeout(() => setMessage(''), 6000);
      resetForm();
      setActiveTab('LIST');
      fetchProperties();
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePublish(id: string, status: string) {
    const token = localStorage.getItem('loveridge_token');
    try {
      const res = await fetch(`/api/admin/properties/${id}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      if (res.ok) fetchProperties();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this property listing?')) return;
    const token = localStorage.getItem('loveridge_token');
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      if (res.ok) fetchProperties();
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleFeatured(id: string, currentFeatured: boolean) {
    const token = localStorage.getItem('loveridge_token');
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ featured: !currentFeatured }),
      });
      if (res.ok) fetchProperties();
    } catch (err) {
      console.error('Failed to toggle featured status:', err);
    }
  }

  function openEdit(prop: any) {
    setEditItem(prop);
    const existingAgent = prop.contactName || prop.agent?.name || 'Kwame Appiah';
    
    setForm({
      title: prop.title,
      description: prop.description,
      listingType: prop.propertyType === 'LAND' ? 'SALE' : prop.listingType,
      propertyType: prop.propertyType,
      price: prop.price.toString(),
      currency: prop.currency || 'USD',
      pricePeriod: prop.propertyType === 'LAND' ? 'outright purchase' : (prop.pricePeriod || (prop.listingType === 'RENT' ? 'per month' : 'outright purchase')),
      bedrooms: (prop.bedrooms || 0).toString(),
      bathrooms: (prop.bathrooms || 0).toString(),
      guestRooms: (prop.guestRooms || 0).toString(),
      boysQuarters: (prop.boysQuarters || 0).toString(),
      garage: (prop.garage || 0).toString(),
      sizeSqft: prop.sizeSqft ? prop.sizeSqft.toString() : '',
      livingAreaSqft: prop.livingAreaSqft ? prop.livingAreaSqft.toString() : '',
      locationAddress: prop.locationAddress,
      city: prop.city,
      region: prop.region || 'Greater Accra',
      featured: prop.featured || false,
      status: prop.status || 'DRAFT',
      imageUrl: prop.imageUrl || '',
      galleryUrls: Array.isArray(prop.galleryUrls) ? prop.galleryUrls : [],
      contactName: existingAgent,
      contactPhone: '+233 24 000 1111',
      contactEmail: 'agent@loveridge.com',
    });

    if (DEFAULT_AGENTS.includes(existingAgent)) {
      setAgentSelectMode(existingAgent);
      setCustomAgentInput('');
    } else {
      setAgentSelectMode('CUSTOM');
      setCustomAgentInput(existingAgent);
    }

    setActiveTab('EDIT');
  }

  function resetForm() {
    setEditItem(null);
    setAgentSelectMode('Kwame Appiah');
    setCustomAgentInput('');
    setForm({
      title: '',
      description: '',
      listingType: 'SALE',
      propertyType: 'LAND',
      price: '',
      currency: 'USD',
      pricePeriod: 'outright purchase',
      bedrooms: '0',
      bathrooms: '0',
      guestRooms: '0',
      boysQuarters: '0',
      garage: '0',
      sizeSqft: '',
      livingAreaSqft: '',
      locationAddress: '',
      city: 'Accra',
      region: 'Greater Accra',
      featured: true,
      status: 'DRAFT',
      imageUrl: '',
      galleryUrls: [],
      contactName: 'Loveridge Staff Agent',
      contactPhone: '+233 24 000 1111',
      contactEmail: 'agent@loveridge.com',
    });
    setGalleryInput('');
  }

  // Cover Image File Upload Handler (Compresses image client-side to prevent Vercel 413 payload limit error)
  async function handleCoverFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file, 900, 900, 0.65);
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
        Array.from(files).map((file) => compressImage(file, 900, 900, 0.65))
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

  function addGalleryUrl() {
    if (!galleryInput.trim()) return;
    setForm((prev) => ({
      ...prev,
      galleryUrls: [...prev.galleryUrls, galleryInput.trim()],
    }));
    setGalleryInput('');
  }

  function removeGalleryUrl(index: number) {
    setForm((prev) => ({
      ...prev,
      galleryUrls: prev.galleryUrls.filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="space-y-6">
      {/* Top Staff Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff Property Listing Portal</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Internal staff workspace to create, upload images, and manage verified property listings.
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
              ← Back to Listings Table
            </button>
          ) : (
            <button
              onClick={() => {
                resetForm();
                setActiveTab('CREATE');
              }}
              className="gradient-btn w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Property Listing
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

      {/* VIEW: PROPERTY CREATION / EDITING CARD FORM */}
      {activeTab !== 'LIST' ? (
        <div className="space-y-8 max-w-5xl mx-auto py-2">
          {/* Top Property Type Selector Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: 'LAND', title: 'Land Plots', desc: 'Commercial & Lease Lands', icon: Trees },
              { type: 'OFFICE_SPACE', title: 'Office Space', desc: 'Executive Towers & Suites', icon: Building },
              { type: 'WAREHOUSE', title: 'Warehouses', desc: 'Logistics Facilities & Storage', icon: Warehouse },
              { type: 'HOUSE', title: 'Residential', desc: 'Houses & Apartments', icon: Building2 },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = form.propertyType === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    if (item.type === 'LAND') {
                      setForm({ ...form, propertyType: item.type, listingType: 'SALE', pricePeriod: 'outright purchase' });
                    } else {
                      setForm({ ...form, propertyType: item.type });
                    }
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50/50 shadow-md ring-2 ring-emerald-700/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                      isSelected ? 'bg-emerald-800 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Listing Details Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8">
            <div className="border-b border-slate-100 pb-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {editItem ? 'Edit Property Listing Details' : 'Property Listing Details'}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Fill in the verified details below to publish your property for rent or sale.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-bold">
                {form.propertyType !== 'LAND' && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, listingType: 'RENT', pricePeriod: 'per month' })}
                    className={`px-4 py-2 rounded-lg transition ${
                      form.listingType === 'RENT' ? 'bg-emerald-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    FOR RENT
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, listingType: 'SALE', pricePeriod: 'outright purchase' })}
                  className={`px-4 py-2 rounded-lg transition ${
                    form.listingType === 'SALE' ? 'bg-emerald-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  FOR SALE
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">Listing Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. 3,500 sqm Heavy Logistics Warehouse for Lease in Tema / 2 Acres Commercial Land in East Legon"
                  className="admin-input"
                />
              </div>

              {/* Property Type, Option & Size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Property Type</label>
                  <select
                    value={form.propertyType}
                    onChange={(e) => {
                      const type = e.target.value;
                      if (type === 'LAND') {
                        setForm({
                          ...form,
                          propertyType: type,
                          listingType: 'SALE',
                          pricePeriod: 'outright purchase',
                        });
                      } else {
                        setForm({ ...form, propertyType: type });
                      }
                    }}
                    className="admin-select"
                  >
                    <option value="LAND">Land Plot</option>
                    <option value="OFFICE_SPACE">Office Space</option>
                    <option value="WAREHOUSE">Warehouse / Logistics</option>
                    <option value="HOUSE">House / Villa</option>
                    <option value="APARTMENT">Apartment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Listing Option</label>
                  <select
                    value={form.listingType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        listingType: e.target.value,
                        pricePeriod: e.target.value === 'RENT' ? 'per month' : 'outright purchase',
                      })
                    }
                    className="admin-select"
                  >
                    {form.propertyType !== 'LAND' && <option value="RENT">For Rent / Lease</option>}
                    <option value="SALE">For Sale (Outright)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Total Plot Size (Sqft)</label>
                  <input
                    type="number"
                    value={form.sizeSqft}
                    onChange={(e) => setForm({ ...form, sizeSqft: e.target.value })}
                    placeholder="e.g. 5000 (sqft)"
                    className="admin-input"
                  />
                </div>
              </div>

              {/* HOUSE & RESIDENTIAL SPECS GRID (Beds, Baths, Guest Rooms, BQ, Garage, Living Area) */}
              {form.propertyType !== 'LAND' && (
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3">
                  <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                    House Specifications & Features Breakdown
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Bedrooms</label>
                      <input
                        type="number"
                        min="0"
                        value={form.bedrooms}
                        onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                        className="admin-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Bathrooms</label>
                      <input
                        type="number"
                        min="0"
                        value={form.bathrooms}
                        onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                        className="admin-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Guest Rooms</label>
                      <input
                        type="number"
                        min="0"
                        value={form.guestRooms}
                        onChange={(e) => setForm({ ...form, guestRooms: e.target.value })}
                        className="admin-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Boys Quarters (BQ)</label>
                      <input
                        type="number"
                        min="0"
                        value={form.boysQuarters}
                        onChange={(e) => setForm({ ...form, boysQuarters: e.target.value })}
                        className="admin-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Garage / Parking</label>
                      <input
                        type="number"
                        min="0"
                        value={form.garage}
                        onChange={(e) => setForm({ ...form, garage: e.target.value })}
                        className="admin-input text-xs"
                        placeholder="e.g. 2 cars"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Living Area (Sqft)</label>
                      <input
                        type="number"
                        min="0"
                        value={form.livingAreaSqft}
                        onChange={(e) => setForm({ ...form, livingAreaSqft: e.target.value })}
                        className="admin-input text-xs"
                        placeholder="e.g. 3500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Currency, Listing Price & Period */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="admin-select"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="GHS">GHS (GH₵)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Listing Price *</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="e.g. 4500"
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Payment Period</label>
                  <input
                    type="text"
                    value={form.pricePeriod}
                    onChange={(e) => setForm({ ...form, pricePeriod: e.target.value })}
                    placeholder="per month, per year, outright"
                    className="admin-input"
                  />
                </div>
              </div>

              {/* City & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">City / Location *</label>
                  <select
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="admin-select"
                  >
                    <option value="Accra">Accra</option>
                    <option value="Tema">Tema</option>
                    <option value="Kumasi">Kumasi</option>
                    <option value="Takoradi">Takoradi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Exact Street / District Address *</label>
                  <input
                    type="text"
                    required
                    value={form.locationAddress}
                    onChange={(e) => setForm({ ...form, locationAddress: e.target.value })}
                    placeholder="e.g. Spintex Commercial Corridor, Near Coca-Cola Roundabout"
                    className="admin-input"
                  />
                </div>
              </div>

              {/* Assigned Internal Owner / Agent Selection Dropdown */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Property Owner / Internal Assigned Agent (Internal Record Only) *
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-800">
                    Selected: <strong className="text-slate-900">{form.contactName || 'Kwame Appiah'}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <select
                      value={agentSelectMode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAgentSelectMode(val);
                        if (val !== 'CUSTOM') {
                          setForm({ ...form, contactName: val });
                          setCustomAgentInput('');
                        } else {
                          const initialCustom = customAgentInput || '';
                          setForm({ ...form, contactName: initialCustom });
                        }
                      }}
                      className="admin-select"
                    >
                      <option value="Kwame Appiah">Kwame Appiah</option>
                      <option value="Kwaku Loveridge">Kwaku Loveridge</option>
                      <option value="Sarah Osei">Sarah Osei</option>
                      <option value="Loveridge Staff Agent">Loveridge Staff Agent</option>
                      <option value="CUSTOM">+ Add Property Owner Name...</option>
                    </select>
                  </div>

                  {agentSelectMode === 'CUSTOM' ? (
                    <div>
                      <input
                        type="text"
                        required
                        value={customAgentInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomAgentInput(val);
                          setForm({ ...form, contactName: val });
                        }}
                        placeholder="Type property owner / agent full name"
                        className="w-full bg-white border border-emerald-400 rounded-xl px-4 py-3 text-xs text-slate-900 font-bold focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <p className="text-[11px] text-slate-500 font-medium">
                        🔒 Internal Record Only: Displays property owner / staff agent details on your admin dashboard. Public users only see official Loveridge Properties contact details.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* COVER IMAGE & MULTI-IMAGE GALLERY UPLOADER SECTION */}
              <div className="p-6 bg-slate-50/80 rounded-3xl border border-slate-200 space-y-6">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-700" /> Property Cover Photo & Gallery Uploads
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Upload image files or paste URLs. Uploaded images instantly reflect on the frontend property listing page.
                    </p>
                  </div>
                </div>

                {/* 1. Cover Image Upload */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-8 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">1. Property Cover Image (Main Thumbnail)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.imageUrl}
                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                        placeholder="Paste Cover Image URL or choose file below..."
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
                        <img src={form.imageUrl} alt="Cover Preview" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <div className="text-center text-slate-400 space-y-1">
                          <ImageIcon className="w-6 h-6 mx-auto opacity-40" />
                          <span className="text-[10px] block font-semibold">No Cover Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Gallery Images Upload */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      2. Property Image Gallery ({form.galleryUrls.length} Photos Added)
                    </label>
                    <label className="bg-emerald-800 hover:bg-emerald-900 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm">
                      <Upload className="w-3.5 h-3.5" /> Add Gallery Image Files
                      <input type="file" accept="image/*" multiple onChange={handleGalleryFileUpload} className="hidden" />
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={galleryInput}
                      onChange={(e) => setGalleryInput(e.target.value)}
                      placeholder="Paste Image URL to add to property gallery..."
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
                        <div key={idx} className="relative group h-24 rounded-xl border border-slate-200 bg-white p-1 overflow-hidden shadow-xs">
                          <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover rounded-lg" />
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

              {/* FEATURED PROPERTY TOGGLE SWITCH */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <label htmlFor="featured-prop-toggle" className="text-xs font-bold text-slate-900 cursor-pointer block">
                    Featured Property
                  </label>
                  <p className="text-[11px] text-slate-600 font-medium">
                    When checked, this property will appear in the Featured Properties section on the home page.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="featured-prop-toggle"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-5 h-5 text-emerald-800 rounded border-slate-300 focus:ring-emerald-800 cursor-pointer shrink-0"
                />
              </div>

              {/* Property Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">Property Description & Specifications *</label>
                <textarea
                  rows={4}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Provide detailed description regarding land clearance/title, power supply, water availability, ceiling clearance for warehouses, or parking and elevator facilities for office suites."
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
                      Saving Property...
                    </>
                  ) : uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Optimizing Images...
                    </>
                  ) : editItem ? (
                    'Publish Property Updates'
                  ) : (
                    'Publish Property Listing Now'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* VIEW: PROPERTY LISTINGS TABLE */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Verified Property Listings Catalog</h3>
            <span className="text-xs text-slate-500 font-medium">{properties.length} Total Properties</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Property Cover</th>
                  <th className="px-6 py-4">Property Title & Type</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Internal Owner / Agent</th>
                  <th className="px-6 py-4">Featured</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Staff Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      Loading property listings...
                    </td>
                  </tr>
                ) : properties.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      No property listings found.
                    </td>
                  </tr>
                ) : (
                  properties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-3">
                        <div className="w-14 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                          <img
                            src={
                              prop.imageUrl ||
                              (prop.propertyType === 'LAND'
                                ? '/property_land.png'
                                : prop.propertyType === 'OFFICE_SPACE'
                                ? '/property_office.png'
                                : prop.propertyType === 'WAREHOUSE'
                                ? '/property_warehouse.png'
                                : '/property_villa.png')
                            }
                            alt={prop.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="line-clamp-1 text-sm text-slate-900">{prop.title}</div>
                        <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                          FOR {prop.listingType} • {prop.propertyType}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-900">
                        {prop.currency} {prop.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{prop.city}</td>

                      {/* INTERNAL OWNER / AGENT COLUMN */}
                      <td className="px-6 py-4 font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                          <span className="truncate max-w-[140px] block" title={prop.contactName || prop.agent?.name || 'Kwame Appiah'}>
                            {prop.contactName || prop.agent?.name || 'Kwame Appiah'}
                          </span>
                        </div>
                      </td>

                      {/* FEATURED TOGGLE BUTTON COLUMN */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => toggleFeatured(prop.id, prop.featured)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition border ${
                            prop.featured
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 hover:text-slate-800'
                          }`}
                          title={prop.featured ? 'Click to unmark as Featured' : 'Click to mark as Featured'}
                        >
                          {prop.featured ? 'Featured' : 'Standard'}
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase border flex items-center gap-1.5 shadow-2xs ${
                              prop.status === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}
                          >
                            {prop.status === 'PUBLISHED' ? (
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
                            onClick={() => handlePublish(prop.id, prop.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')}
                            className="text-[10px] font-extrabold text-slate-500 hover:text-emerald-800 underline transition pt-0.5"
                          >
                            {prop.status === 'PUBLISHED' ? 'Unpublish to Draft' : '⚡ Publish Now'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEdit(prop)}
                          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prop.id)}
                          className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200"
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
