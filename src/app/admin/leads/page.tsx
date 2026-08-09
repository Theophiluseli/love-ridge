'use client';

import { useState, useEffect } from 'react';
import {
  Inbox, PhoneCall, Mail, Calendar, Package, Building2, CheckCircle2,
  Eye, X, MessageSquare, ExternalLink, Search, Filter, ShieldCheck, User
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  async function fetchLeads() {
    setLoading(true);
    try {
      const token = localStorage.getItem('loveridge_token');
      const res = await fetch('/api/admin/leads', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  async function updateStatus(id: string, status: string) {
    const token = localStorage.getItem('loveridge_token');
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchLeads();
        if (selectedLead && selectedLead.id === id) {
          setSelectedLead((prev: any) => (prev ? { ...prev, status } : null));
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Filter & Search Logic
  const filteredLeads = leads.filter((lead) => {
    const matchesFilter = filterType === 'ALL' || lead.type === filterType;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      lead.name?.toLowerCase().includes(q) ||
      lead.email?.toLowerCase().includes(q) ||
      lead.phone?.toLowerCase().includes(q) ||
      lead.message?.toLowerCase().includes(q) ||
      lead.property?.title?.toLowerCase().includes(q) ||
      lead.product?.name?.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const countNew = leads.filter((l) => l.status === 'NEW').length;
  const countProperty = leads.filter((l) => l.type === 'PROPERTY_VIEWING').length;
  const countProduct = leads.filter((l) => l.type === 'PRODUCT_QUOTE').length;

  return (
    <div className="space-y-6 pb-10">
      {/* Streamlined Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 px-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Filter Tabs */}
        <div className="flex bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-xs shrink-0">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === 'ALL'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Inquiries ({leads.length})
          </button>
          <button
            onClick={() => setFilterType('PROPERTY_VIEWING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === 'PROPERTY_VIEWING'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Property Viewings ({countProperty})
          </button>
          <button
            onClick={() => setFilterType('PRODUCT_QUOTE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === 'PRODUCT_QUOTE'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Product Quotes ({countProduct})
          </button>
        </div>

        {/* Quick Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inquiries by inquirer name, email, phone, keyword..."
            className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 font-normal focus:outline-none focus:bg-white focus:border-emerald-700 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-3 text-xs font-medium shrink-0">
          <span className="px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-600">
            Total: <strong className="text-slate-900">{leads.length}</strong>
          </span>
          <span className="px-3 py-1.5 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-700 font-medium">
            New: <strong className="text-rose-700 font-bold">{countNew}</strong>
          </span>
        </div>
      </div>

      {/* Leads Catalog Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-3.5 px-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-emerald-800" />
            <h3 className="font-semibold text-xs text-slate-900">Inquiry Directory & Messages</h3>
          </div>
          <span className="text-[11px] text-slate-500 font-normal">
            Showing {filteredLeads.length} of {leads.length} Messages
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-600 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-semibold">Inquirer Details</th>
                <th className="px-5 py-3 font-semibold">Inquiry Type & Reference</th>
                <th className="px-5 py-3 font-semibold">Message Summary</th>
                <th className="px-5 py-3 font-semibold">Received Date</th>
                <th className="px-5 py-3 font-semibold">Pipeline Status</th>
                <th className="px-5 py-3 font-semibold text-right">Actions & Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                    Loading lead inquiries pipeline...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                    No lead inquiries match your current filter.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition">
                    {/* 1. Inquirer Contact Info */}
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-xs text-slate-900">{lead.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-normal">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <a href={`mailto:${lead.email}`} className="hover:underline hover:text-emerald-800">
                          {lead.email}
                        </a>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-normal">
                        <PhoneCall className="w-3 h-3 text-slate-400 shrink-0" />
                        <a href={`tel:${lead.phone}`} className="hover:underline hover:text-emerald-800">
                          {lead.phone}
                        </a>
                      </div>
                    </td>

                    {/* 2. Inquiry Type Badge & Referenced Item */}
                    <td className="px-5 py-3.5 max-w-xs">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded uppercase tracking-wide mb-1 border ${
                          lead.type === 'PROPERTY_VIEWING'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {lead.type === 'PROPERTY_VIEWING' ? 'Property Viewing' : 'Product Quote'}
                      </span>
                      <div className="text-xs font-medium text-slate-900 truncate">
                        {lead.property?.title || lead.product?.name || 'General Inquiry'}
                      </div>
                    </td>

                    {/* 3. Message Snippet (Clickable to open pop-up) */}
                    <td className="px-5 py-3.5 max-w-xs">
                      <div
                        onClick={() => setSelectedLead(lead)}
                        className="text-slate-600 text-xs line-clamp-1 leading-relaxed font-normal hover:text-emerald-800 cursor-pointer transition"
                        title="Click to view full message popup"
                      >
                        "{lead.message}"
                      </div>
                    </td>

                    {/* 4. Date */}
                    <td className="px-5 py-3.5 text-slate-500 text-[11px] font-normal whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* 5. Pipeline Status Badge */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-medium rounded-full uppercase border ${
                          lead.status === 'NEW'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : lead.status === 'CONTACTED'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : lead.status === 'QUALIFIED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    {/* 6. Staff Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-medium inline-flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>

                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-normal focus:border-emerald-700 cursor-pointer shadow-2xs"
                      >
                        <option value="NEW">Status: NEW</option>
                        <option value="CONTACTED">Status: CONTACTED</option>
                        <option value="QUALIFIED">Status: QUALIFIED</option>
                        <option value="CONVERTED">Status: CONVERTED</option>
                        <option value="CLOSED">Status: CLOSED</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POP-UP INQUIRY VIEW MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-medium rounded uppercase border ${
                      selectedLead.type === 'PROPERTY_VIEWING'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}
                  >
                    {selectedLead.type === 'PROPERTY_VIEWING' ? 'Property Viewing' : 'Product Quotation'}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-medium rounded border ${
                      selectedLead.status === 'NEW'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {selectedLead.status}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-slate-900">Inquiry & Lead Details</h2>
                <p className="text-[11px] text-slate-500 font-normal">
                  Received on {new Date(selectedLead.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inquirer Info Box */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">
                  {selectedLead.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900">{selectedLead.name}</h3>
                  <p className="text-[11px] text-slate-500 font-normal">Inquirer Contact Record</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-normal pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <a href={`mailto:${selectedLead.email}`} className="hover:underline hover:text-emerald-900">
                    {selectedLead.email}
                  </a>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <a href={`tel:${selectedLead.phone}`} className="hover:underline hover:text-emerald-900">
                    {selectedLead.phone}
                  </a>
                </div>
              </div>

              {/* Action Links */}
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={`https://wa.me/${selectedLead.phone?.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedLead.name)},%20thank%20you%20for%20contacting%20Loveridge%20Properties.`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-3 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium inline-flex items-center gap-1 transition"
                >
                  <PhoneCall className="w-3 h-3 text-emerald-300" /> WhatsApp
                </a>
                <a
                  href={`mailto:${selectedLead.email}?subject=Regarding%20your%20Loveridge%20Inquiry`}
                  className="py-1.5 px-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium inline-flex items-center gap-1 transition"
                >
                  <Mail className="w-3 h-3 text-slate-500" /> Email Reply
                </a>
              </div>
            </div>

            {/* Referenced Catalog Item */}
            {(selectedLead.property || selectedLead.product) && (
              <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/80 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 block">
                  Referenced Catalog Item
                </span>
                <div className="font-semibold text-xs text-slate-900 flex items-center justify-between">
                  <span>{selectedLead.property?.title || selectedLead.product?.name}</span>
                  {selectedLead.property?.slug && (
                    <Link
                      href={`/properties/${selectedLead.property.slug}`}
                      target="_blank"
                      className="text-xs font-medium text-emerald-800 hover:underline flex items-center gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                  {selectedLead.product?.slug && (
                    <Link
                      href={`/products/${selectedLead.product.slug}`}
                      target="_blank"
                      className="text-xs font-medium text-emerald-800 hover:underline flex items-center gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Full Message Text */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                Full Inquiry Message & Requirements
              </span>
              <div className="p-4 rounded-xl bg-slate-50 text-slate-800 text-xs leading-relaxed font-normal whitespace-pre-line border border-slate-200/80">
                "{selectedLead.message}"
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Status:</span>
                <select
                  value={selectedLead.status}
                  onChange={(e) => updateStatus(selectedLead.id, e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:border-emerald-700 cursor-pointer shadow-2xs"
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="CONVERTED">CONVERTED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


