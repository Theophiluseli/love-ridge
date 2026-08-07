'use client';

import { useState, useEffect } from 'react';
import { Inbox, PhoneCall, Mail, Calendar, Package, Building2, CheckCircle2 } from 'lucide-react';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

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
      if (res.ok) fetchLeads();
    } catch (err) {
      console.error(err);
    }
  }

  const filteredLeads =
    filterType === 'ALL' ? leads : leads.filter((l) => l.type === filterType);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Unified Inquiry & Lead Pipeline</h1>
          <p className="text-xs text-slate-400">
            View, assign, and manage property viewing requests and bulk material quotes.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterType === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            All Inquiries ({leads.length})
          </button>
          <button
            onClick={() => setFilterType('PROPERTY_VIEWING')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterType === 'PROPERTY_VIEWING'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400'
            }`}
          >
            Property Viewings
          </button>
          <button
            onClick={() => setFilterType('PRODUCT_QUOTE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterType === 'PRODUCT_QUOTE'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400'
            }`}
          >
            Product Quotes
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Inquirer Details</th>
                <th className="px-6 py-4">Inquiry Type & Reference</th>
                <th className="px-6 py-4">Message / Requirements</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Pipeline Status</th>
                <th className="px-6 py-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading inbox leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No lead inquiries found.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-900/50 transition">
                    <td className="px-6 py-4 font-semibold text-white">
                      <div>{lead.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-amber-400" /> {lead.email}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <PhoneCall className="w-3 h-3 text-amber-400" /> {lead.phone}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded uppercase mb-1 ${
                          lead.type === 'PROPERTY_VIEWING'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {lead.type.replace('_', ' ')}
                      </span>
                      <div className="text-xs font-semibold text-white">
                        {lead.property?.title || lead.product?.name || 'General Contact'}
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed">
                        "{lead.message}"
                      </p>
                    </td>

                    <td className="px-6 py-4 text-slate-400 text-[11px]">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${
                          lead.status === 'NEW'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : lead.status === 'CONTACTED'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : lead.status === 'QUALIFIED'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:border-amber-500"
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="QUALIFIED">QUALIFIED</option>
                        <option value="CONVERTED">CONVERTED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
