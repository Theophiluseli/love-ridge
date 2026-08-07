'use client';

import { useState } from 'react';
import { Settings, Save, Key, MessageSquare, Mail, Globe } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Love Ridge Properties & Store',
    contactEmail: 'info@loveridgeproperty.com',
    contactPhone: '+233 24 000 1111',
    whatsappNumber: '233240001111',
    smtpHost: 'smtp.resend.com',
    smtpPort: '587',
    currencyDefault: 'USD',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">System Settings & Integrations</h1>
        <p className="text-xs text-slate-400">
          Configure site brand metadata, WhatsApp Business notifications, and email triggers.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl font-bold">
          ✓ System settings updated successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Platform Metadata
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Site Title</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Default Currency</label>
              <select
                value={settings.currencyDefault}
                onChange={(e) => setSettings({ ...settings, currencyDefault: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-amber-500"
              >
                <option value="USD">USD ($)</option>
                <option value="GHS">GHS (₵)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Notification Integrations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp Business Line</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="gradient-btn px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <Save className="w-4 h-4" /> Save System Settings
        </button>
      </form>
    </div>
  );
}
