'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Save, Key, MessageSquare, Globe, CheckCircle, Shield, Image as ImageIcon, ArrowRight } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [settings, setSettings] = useState({
    siteName: 'Love Ridge Properties & Store',
    contactEmail: 'info@loveridgeproperty.com',
    contactPhone: '0246432493',
    whatsappNumber: '233246432493',
    currencyDefault: 'USD',
  });

  const [adminEmail, setAdminEmail] = useState('admin@loveridge.com');
  const [emailMsg, setEmailMsg] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load saved system settings & user email on page mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('loveridge_system_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      const localUser = localStorage.getItem('loveridge_user');
      if (localUser) {
        const u = JSON.parse(localUser);
        if (u.email) setAdminEmail(u.email);
      }
    } catch (e) {
      console.error('Failed to load local settings:', e);
    }

    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.settings && !data.isDefault) {
          setSettings(data.settings);
          localStorage.setItem('loveridge_system_settings', JSON.stringify(data.settings));
        }
      })
      .catch((e) => console.warn('Could not sync settings from server:', e));
  }, []);

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    setEmailMsg('');
    setEmailErr('');
    setEmailLoading(true);

    try {
      const token = localStorage.getItem('loveridge_token');
      const res = await fetch('/api/auth/update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail: adminEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update email.');

      setEmailMsg('Admin login email updated successfully!');
      const localUser = localStorage.getItem('loveridge_user');
      if (localUser) {
        const u = JSON.parse(localUser);
        u.email = adminEmail;
        localStorage.setItem('loveridge_user', JSON.stringify(u));
      }
    } catch (err: any) {
      setEmailErr(err.message || 'Error updating email.');
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      localStorage.setItem('loveridge_system_settings', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);

      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPasswordErr('New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('loveridge_token');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password.');

      setPasswordMsg('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordErr(err.message || 'An error occurred.');
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Settings & Admin Security</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Manage brand details, company contact lines, and update your admin account credentials.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" /> System settings updated successfully.
        </div>
      )}

      {/* Hero Background Carousel Shortcut Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-emerald-500/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase border border-emerald-500/30">
            <ImageIcon className="w-3.5 h-3.5" /> Homepage Hero Customization
          </div>
          <h3 className="text-xl font-black tracking-tight">Hero Section Background Carousel Manager</h3>
          <p className="text-xs text-emerald-100/80 font-medium max-w-lg">
            Upload custom background images, reorder sequence, toggle active slides, and preview live transitions in real-time.
          </p>
        </div>

        <Link
          href="/admin/hero"
          className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg transition shrink-0"
        >
          Manage Hero Slides <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Admin Email Update Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-700" /> Admin Account Login Email
            </h3>
            <p className="text-xs text-slate-500 font-medium">Update the primary email address used for admin authentication.</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold border border-emerald-200">
            Account Email
          </span>
        </div>

        {emailMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl font-bold">
            {emailMsg}
          </div>
        )}

        {emailErr && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-bold">
            {emailErr}
          </div>
        )}

        <form onSubmit={handleEmailChange} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">New Admin Login Email</label>
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="e.g. desmond@loveridge.com or admin@loveridge.com"
              className="admin-input"
            />
          </div>
          <button
            type="submit"
            disabled={emailLoading}
            className="gradient-btn px-6 py-3 rounded-xl text-xs font-bold shrink-0 w-full sm:w-auto shadow-md"
          >
            {emailLoading ? 'Updating Email...' : 'Update Login Email'}
          </button>
        </form>
      </div>

      {/* Admin Account & Password Change Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-700" /> Admin Account Password Security
            </h3>
            <p className="text-xs text-slate-500 font-medium">Update your admin login password securely.</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold border border-emerald-200">
            Authenticated Admin
          </span>
        </div>

        {passwordMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl font-bold">
            {passwordMsg}
          </div>
        )}

        {passwordErr && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-bold">
            {passwordErr}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={passForm.currentPassword}
                onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={passForm.newPassword}
                onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                placeholder="Min 6 characters"
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={passForm.confirmPassword}
                onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                placeholder="Re-type new password"
                className="admin-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            {passwordLoading ? 'Updating Password...' : 'Update Admin Password'}
          </button>
        </form>
      </div>

      {/* Platform Metadata & Integrations Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-emerald-700" /> Platform Metadata & Contact Lines
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Site Title</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Official Phone Line</label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Company WhatsApp Business Line</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Official Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="admin-input"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="gradient-btn px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md">
          <Save className="w-4 h-4" /> Save System Settings
        </button>
      </form>
    </div>
  );
}
