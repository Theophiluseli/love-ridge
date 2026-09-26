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
  Menu,
  X,
  Image as ImageIcon,
  Images,
} from 'lucide-react';
import Logo from '@/components/Logo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    let localUser = localStorage.getItem('loveridge_user');
    let localToken = localStorage.getItem('loveridge_token');

    // On local dev / localhost testing, if credentials aren't initialized yet, auto-provision Desmond Senanu session
    if ((!localUser || !localToken) && typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocal) {
        const defaultAdmin = {
          id: 'admin-fallback-id',
          name: 'Desmond Senanu',
          email: 'admin@loveridge.com',
          phone: '+233 24 643 2493',
          role: 'Super Admin',
          permissions: ['*'],
        };
        localUser = JSON.stringify(defaultAdmin);
        localToken = 'dev-token-' + Date.now();
        localStorage.setItem('loveridge_user', localUser);
        localStorage.setItem('loveridge_token', localToken);
      }
    }

    if (!localUser || !localToken) {
      window.location.href = '/admin/login';
      return;
    }

    try {
      const parsed = JSON.parse(localUser);
      if (!parsed.name || parsed.name === 'Kwaku Loveridge' || parsed.name === 'Super Admin' || parsed.name === 'Admin User') {
        parsed.name = 'Desmond Senanu';
        localStorage.setItem('loveridge_user', JSON.stringify(parsed));
      }
      setUser(parsed);
    } catch (e) {
      window.location.href = '/admin/login';
      return;
    } finally {
      setLoading(false);
    }
  }, [pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll and prevent touch-drag bleed when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-bold text-slate-500">Loading Admin Control Center...</div>
      </div>
    );
  }

  const navigation = [
    { href: '/admin/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { href: '/admin/properties', label: 'Property Listings', icon: Building2 },
    { href: '/admin/products', label: 'Store', icon: Package },
    { href: '/admin/gallery', label: 'Gallery Management', icon: Images },
    { href: '/admin/hero', label: 'Hero Backgrounds', icon: ImageIcon },
    { href: '/admin/leads', label: 'Inquiry Inbox', icon: Inbox },
    { href: '/admin/settings', label: 'Site Settings & Security', icon: Settings },
  ];

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('loveridge_user');
    localStorage.removeItem('loveridge_token');
    router.push('/admin/login');
  }

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900 flex overflow-hidden">
      {/* Desktop Sidebar (Smooth Independent Scrolling, Never Glitches Window) */}
      <aside className="w-64 bg-white border-r border-slate-200 shadow-xs hidden md:flex flex-col justify-between p-4 shrink-0 h-full overflow-y-auto overscroll-contain select-none">
        <div className="space-y-6 flex-1 min-h-0 flex flex-col">
          {/* Logo */}
          <div className="pt-2 px-1 shrink-0">
            <Logo className="h-10" />
          </div>

          {/* User Badge */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 shrink-0">
            <span className="text-xs font-bold text-slate-900 block truncate">{user?.name || 'Desmond Senanu'}</span>
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-800 text-white">
              Administrator
            </span>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1 overflow-y-auto flex-1 pr-1 overscroll-contain">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition active:scale-98 ${
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

        {/* Footer Actions (Always Anchored at Bottom) */}
        <div className="pt-4 border-t border-slate-100 space-y-2 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-800 hover:bg-slate-100 transition"
          >
            <span>View Public Website</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-white h-full max-h-screen shadow-2xl p-5 flex flex-col justify-between z-10 space-y-6 overflow-y-auto overscroll-contain animate-in slide-in-from-left duration-200">
            <div className="space-y-6 flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
                <Logo className="h-8 sm:h-9" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile User Badge */}
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1 shrink-0">
                <span className="text-xs font-bold text-slate-900 block truncate">{user?.name || 'Desmond Senanu'}</span>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-800 text-white">
                  Administrator
                </span>
              </div>

              {/* Mobile Nav Links */}
              <nav className="space-y-1 overflow-y-auto flex-1 pr-1 overscroll-contain">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition active:scale-98 ${
                        isActive
                          ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer Actions */}
            <div className="pt-4 border-t border-slate-100 space-y-2 shrink-0">
              <Link
                href="/"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <span>View Public Website</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Admin Content Container */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Top Header - Anchored Header, Never Jitters or Glitches Window */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 transition cursor-pointer md:hidden"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-none">
              Control Center / <span className="text-slate-900 font-bold">{pathname.replace('/admin/', '')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[11px] sm:text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
              <span className="sm:hidden">Admin</span>
              <span className="hidden sm:inline">Administrator Portal</span>
            </span>
          </div>
        </header>

        {/* Isolated Smooth-Scrolling Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 overscroll-contain">
          {children}
        </main>
      </div>
    </div>
  );
}
