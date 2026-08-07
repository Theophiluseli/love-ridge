'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Search, ShieldCheck, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    listingType: 'SALE',
    propertyType: 'HOUSE',
    price: '',
    bedrooms: '3',
    bathrooms: '3',
    sizeSqft: '2500',
    locationAddress: '',
    city: 'Accra',
    region: 'Greater Accra',
    featured: false,
  });

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
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Operation failed.');

      setMessage(editItem ? 'Property updated successfully' : 'Property created successfully');
      setModalOpen(false);
      resetForm();
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
      bedrooms: prop.bedrooms.toString(),
      bathrooms: prop.bathrooms.toString(),
      sizeSqft: prop.sizeSqft ? prop.sizeSqft.toString() : '',
      locationAddress: prop.locationAddress,
      city: prop.city,
      region: prop.region || 'Greater Accra',
      featured: prop.featured || false,
    });
    setModalOpen(true);
  }

  function resetForm() {
    setEditItem(null);
    setForm({
      title: '',
      description: '',
      listingType: 'SALE',
      propertyType: 'HOUSE',
      price: '',
      bedrooms: '3',
      bathrooms: '3',
      sizeSqft: '2500',
      locationAddress: '',
      city: 'Accra',
      region: 'Greater Accra',
      featured: false,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Property Listing Management</h1>
          <p className="text-xs text-slate-500 font-medium">
            Create, update, review agent listings, and set publish statuses.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Listing
        </button>
      </div>

      {/* Property Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Property Title</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">

              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading properties...
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
                  <tr key={prop.id} className="hover:bg-slate-900/50 transition">
                    <td className="px-6 py-4 font-semibold text-white">
                      <div className="line-clamp-1">{prop.title}</div>
                      <div className="text-[10px] text-slate-500">By: {prop.createdBy?.name}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-amber-400">
                      {prop.listingType} • {prop.propertyType}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {prop.currency} {prop.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{prop.city}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${
                          prop.status === 'PUBLISHED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : prop.status === 'PENDING_REVIEW'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {prop.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {prop.status === 'PENDING_REVIEW' && (
                        <button
                          onClick={() => handlePublish(prop.id, 'PUBLISHED')}
                          className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg text-[10px] font-bold hover:bg-emerald-500/30"
                        >
                          Approve & Publish
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(prop)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prop.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
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

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel max-w-2xl w-full rounded-2xl border border-slate-800 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">
              {editItem ? 'Edit Property Listing' : 'Create New Property Listing'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. 4-Bedroom Villa in East Legon"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Listing Type</label>
                  <select
                    value={form.listingType}
                    onChange={(e) => setForm({ ...form, listingType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-amber-500"
                  >
                    <option value="SALE">SALE</option>
                    <option value="RENT">RENT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Property Type</label>
                  <select
                    value={form.propertyType}
                    onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-amber-500"
                  >
                    <option value="HOUSE">HOUSE / VILLA</option>
                    <option value="APARTMENT">APARTMENT</option>
                    <option value="DUPLEX">DUPLEX</option>
                    <option value="TOWNHOUSE">TOWNHOUSE</option>
                    <option value="LAND">LAND</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price (USD / GHS)</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location Address</label>
                  <input
                    type="text"
                    required
                    value={form.locationAddress}
                    onChange={(e) => setForm({ ...form, locationAddress: e.target.value })}
                    placeholder="e.g. Lagos Avenue, East Legon"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    value={form.bedrooms}
                    onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    value={form.bathrooms}
                    onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Size (sqft)</label>
                  <input
                    type="number"
                    value={form.sizeSqft}
                    onChange={(e) => setForm({ ...form, sizeSqft: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="feat"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-amber-500"
                />
                <label htmlFor="feat" className="text-xs text-slate-300">Feature this listing on homepage</label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400"
                >
                  Cancel
                </button>
                <button type="submit" className="gradient-btn flex-1 py-2.5 rounded-xl text-xs font-bold">
                  Save Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
