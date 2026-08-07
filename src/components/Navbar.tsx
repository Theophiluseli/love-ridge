'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PhoneCall, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenu, setMobileMenu] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/properties', label: 'Properties' },
    { href: '/products', label: 'Our Store' },
    { href: '/services', label: 'Services' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <div className="sticky top-3 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Floating Pill Capsule */}
      <header className="bg-slate-950/90 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-slate-950/40 rounded-full px-5 py-2.5 flex items-center justify-between relative transition-all">
        {/* Logo (Left) */}
        <Link href="/" className="flex items-center group pl-1 shrink-0 z-10">
          <Logo className="h-10 group-hover:scale-105 transition-transform duration-300" variant="light" />
        </Link>

        {/* Centered Navigation Menu */}
        <nav className="hidden lg:flex items-center space-x-1 bg-white/5 p-1 rounded-full border border-white/10 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Button */}
        <div className="hidden lg:flex items-center z-10">
          <a
            href="https://wa.me/233240001111?text=Hello%20Loveridge%20Properties,%20I%20am%20interested%20in%20your%20listings%20and%20materials."
            target="_blank"
            rel="noreferrer"
            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black px-5 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
          >
            <PhoneCall className="w-3.5 h-3.5" /> Inquiry
          </a>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="lg:hidden p-2 rounded-full text-slate-200 hover:text-white hover:bg-white/10"
        >
          {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenu && (
        <div className="lg:hidden mt-2 bg-slate-950/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 space-y-2 shadow-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenu(false)}
              className="block px-4 py-3 rounded-2xl text-sm font-bold text-slate-200 hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin/login"
            onClick={() => setMobileMenu(false)}
            className="block px-4 py-3 rounded-2xl text-sm font-bold text-white bg-emerald-900 border border-emerald-700"
          >
            Admin Management Portal
          </Link>
        </div>
      )}
    </div>
  );
}
