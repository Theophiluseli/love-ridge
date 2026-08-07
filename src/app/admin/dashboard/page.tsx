'use client';

import { useState, useEffect } from 'react';
import { Building2, Package, Inbox, TrendingUp, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const token = localStorage.getItem('loveridge_token');
        const res = await fetch('/api/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-500 font-medium">Loading KPI analytics...</div>;
  }

  const kpis = data?.kpis || {};
  const recentLeads = data?.recentLeads || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Executive Control Dashboard</h1>
        <p className="text-xs text-slate-500 font-medium">
          Real-time performance metrics across property listings, product inventory & customer inquiries.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Properties</span>
            <Building2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-slate-900">{kpis.publishedProperties || 0}</div>
          <span className="text-[11px] text-emerald-800 font-bold block">
            {kpis.pendingProperties || 0} pending review
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Catalogue Products</span>
            <Package className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-slate-900">{kpis.totalProducts || 0}</div>
          <span className="text-[11px] text-amber-800 font-bold block">
            {kpis.lowStockProducts || 0} low stock / pre-order
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Inquiries</span>
            <Inbox className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-slate-900">{kpis.totalLeads || 0}</div>
          <span className="text-[11px] text-emerald-800 font-bold block">
            {kpis.newLeads || 0} unaddressed leads
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Viewing vs Quote</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {kpis.viewingLeads || 0} / {kpis.quoteLeads || 0}
          </div>
          <span className="text-[11px] text-slate-500 font-medium block">Property Viewings / Product Quotes</span>
        </div>
      </div>

      {/* Recent Inquiry Inbox */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Customer Inquiries</h3>
            <p className="text-xs text-slate-500">Viewing bookings & bulk product price quotes</p>
          </div>
          <Link
            href="/admin/leads"
            className="text-xs text-emerald-800 font-bold hover:underline flex items-center gap-1"
          >
            Manage All Leads <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentLeads.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No leads recorded yet.</div>
          ) : (
            recentLeads.map((lead: any) => (
              <div key={lead.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        lead.type === 'PROPERTY_VIEWING'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {lead.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{lead.name}</span>
                    <span className="text-xs text-slate-500">({lead.email})</span>
                  </div>
                  <p className="text-xs text-slate-700 line-clamp-1">"{lead.message}"</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {lead.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
