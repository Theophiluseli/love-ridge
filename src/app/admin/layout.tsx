'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Package,
  Inbox,
  Users,
  ShieldCheck,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import Logo from '@/components/Logo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    const localUser = localStorage.getItem('loveridge_user');
    if (!localUser) {
      router.push('/admin/login');
      return;
    }

    try {
      setUser(JSON.parse(localUser));
    } catch (e) {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [pathname]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="text-sm font-semibold text-slate-500">Verifying session token...</div>
      </div>
    );
  }

  const roleName = user?.role || 'Staff';

  const navigation = [
    { href: '/admin/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { href: '/admin/properties', label: 'Property Listings', icon: Building2 },
    { href: '/admin/products', label: 'Building Materials', icon: Package },
    { href: '/admin/leads', label: 'Inquiry Inbox', icon: Inbox },
    ...(roleName === 'Super Admin'
      ? [
          { href: '/admin/users', label: 'User Accounts', icon: Users },
          { href: '/admin/roles-permissions', label: 'Roles & RBAC', icon: ShieldCheck },
          { href: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
        ]
      : []),
    { href: '/admin/settings', label: 'Site Settings', icon: Settings },
  ];

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('loveridge_user');
    localStorage.removeItem('loveridge_token');
    router.push('/admin/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 shadow-sm hidden md:flex flex-col justify-between p-4 sticky top-0 h-screen">
        <div className="space-y-6">
          {/* Logo */}
          <div className="pt-2 px-1">
            <Logo className="h-10" />
          </div>

          {/* User Badge */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
            <span className="text-xs font-bold text-slate-900 block truncate">{user?.name || 'Staff User'}</span>
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-800 text-white">
              {roleName}
            </span>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-800 hover:bg-slate-100 transition"
          >
            <span>View Public Website</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">
            Control Center / <span className="text-slate-900 font-bold">{pathname.replace('/admin/', '')}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Role: {roleName}
            </span>
          </div>
        </header>

        <main className="p-6 sm:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
