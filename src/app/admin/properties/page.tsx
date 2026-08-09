'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Search, ShieldCheck, Eye, Image as ImageIcon, Trees, Warehouse, Building, Building2, Upload, ArrowRight, X, Sparkles, Phone, Mail, User } from 'lucide-react';
import Link from 'next/link';

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form View State
  const [activeTab, setActiveTab] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
  const [editItem, setEditItem] = useState<any>(null);

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
    sizeSqft: '',
    locationAddress: '',
    city: 'Accra',
    region: 'Greater Accra',
    featured: true,
    imageUrl: '',
    galleryUrls: [] as string[],
    contactName: 'Loveridge Staff Agent',
    contactPhone: '+233 24 000 1111',
    contactEmail: 'agent@loveridge.com',
  });

  const [galleryInput, setGalleryInput] = useState('');
  const [message, setMessage] = useState('');

  async function fetchProperties() {
    setLoading(true);
    try {
      const token = localStorage.getItem('loveridge_token');
      const res = await fetch('/api/admin/properties', {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('loveridge_token');
    const url = editItem ? `/api/admin/properties/${editItem.id}` : '/api/admin/properties';
    const method = editItem ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          galleryUrls: form.galleryUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Operation failed.');

      setMessage(editItem ? 'Property updated successfully!' : 'Property created & published successfully!');
      setTimeout(() => setMessage(''), 3000);
      resetForm();
      setActiveTab('LIST');
      fetchProperties();
    } catch (err: any) {
      alert(err.message);
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
      if (res.ok) fetchProperties();
    } catch (err) {
      console.error(err);
    }
  }

  function openEdit(prop: any) {
    setEditItem(prop);
    setForm({
      title: prop.title,
      description: prop.description,
      listingType: prop.listingType,
      propertyType: prop.propertyType,
      price: prop.price.toString(),
      currency: prop.currency || 'USD',
      pricePeriod: prop.pricePeriod || (prop.listingType === 'RENT' ? 'per month' : 'outright purchase'),
      bedrooms: (prop.bedrooms || 0).toString(),
      bathrooms: (prop.bathrooms || 0).toString(),
      sizeSqft: prop.sizeSqft ? prop.sizeSqft.toString() : '',
      locationAddress: prop.locationAddress,
      city: prop.city,
      region: prop.region || 'Greater Accra',
      featured: prop.featured || false,
      imageUrl: prop.imageUrl || '',
      galleryUrls: Array.isArray(prop.galleryUrls) ? prop.galleryUrls : [],
      contactName: 'Loveridge Staff Agent',
      contactPhone: '+233 24 000 1111',
      contactEmail: 'agent@loveridge.com',
    });
    setActiveTab('EDIT');
  }

  function resetForm() {
    setEditItem(null);
    setForm({
      title: '',
      description: '',
      listingType: 'RENT',
      propertyType: 'LAND',
      price: '',
      currency: 'USD',
      pricePeriod: 'per month',
      bedrooms: '0',
      bathrooms: '0',
      sizeSqft: '',
      locationAddress: '',
      city: 'Accra',
      region: 'Greater Accra',
      featured: true,
      imageUrl: '',
      galleryUrls: [],
      contactName: 'Loveridge Staff Agent',
      contactPhone: '+233 24 000 1111',
      contactEmail: 'agent@loveridge.com',
    });
    setGalleryInput('');
  }

  // Cover Image File Upload Handler (Converts file to base64 Data URL)
  function handleCoverFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setForm((prev) => ({ ...prev, imageUrl: event.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  }

  // Gallery File Upload Handler
  function handleGalleryFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newUrl = event.target!.result as string;
          setForm((prev) => ({
            ...prev,
            galleryUrls: [...prev.galleryUrls, newUrl],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
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
                  onClick={() => setForm({ ...form, propertyType: item.type })}
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
                <button
                  type="button"
                  onClick={() => setForm({ ...form, listingType: 'RENT', pricePeriod: 'per month' })}
                  className={`px-4 py-2 rounded-lg transition ${
                    form.listingType === 'RENT' ? 'bg-emerald-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  FOR RENT
                </button>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:border-emerald-700 focus:bg-white transition"
                />
              </div>

              {/* Property Type, Option & Size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Property Type</label>
                  <select
                    value={form.propertyType}
                    onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:border-emerald-700"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:border-emerald-700"
                  >
                    <option value="RENT">For Rent / Lease</option>
                    <option value="SALE">For Sale (Outright)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Size (Sqft / Acres)</label>
                  <input
                    type="number"
                    value={form.sizeSqft}
                    onChange={(e) => setForm({ ...form, sizeSqft: e.target.value })}
                    placeholder="e.g. 5000 (sqft) or 87120 (2 acres)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:border-emerald-700 focus:bg-white"
                  />
                </div>
              </div>

              {/* Currency, Listing Price & Period */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:border-emerald-700"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:border-emerald-700 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Payment Period</label>
                  <input
                    type="text"
                    value={form.pricePeriod}
                    onChange={(e) => setForm({ ...form, pricePeriod: e.target.value })}
                    placeholder="per month, per year, outright"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:border-emerald-700 focus:bg-white"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:border-emerald-700"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:border-emerald-700 focus:bg-white"
                  />
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

                    {/* Presets */}
                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                      <span className="text-[10px] font-bold text-slate-500 shrink-0">Quick Presets:</span>
                      {[
                        { label: 'Land', url: '/property_land.png' },
                        { label: 'Office', url: '/property_office.png' },
                        { label: 'Warehouse', url: '/property_warehouse.png' },
                        { label: 'Villa', url: '/property_villa.png' },
                        { label: 'Apartment', url: '/property_apartment.png' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, imageUrl: preset.url }))}
                          className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-700 hover:bg-slate-100 shrink-0"
                        >
                          {preset.label}
                        </button>
                      ))}
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

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab('LIST');
                  }}
                  className="flex-1 py-3.5 rounded-2xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="gradient-btn flex-1 py-3.5 rounded-2xl text-xs font-bold shadow-lg">
                  {editItem ? 'Update Property Listing' : 'Publish Property Listing Now'}
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
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Staff Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Loading property listings...
                    </td>
                  </tr>
                ) : properties.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
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
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase border ${
                            prop.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {prop.status}
                        </span>
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
