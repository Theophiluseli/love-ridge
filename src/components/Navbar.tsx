'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PhoneCall, Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';
import { useCurrency, SupportedCurrency } from '@/context/CurrencyContext';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenu, setMobileMenu] = useState(false);
  const { currency, setCurrency } = useCurrency();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/properties', label: 'Properties & Commercial' },
    { href: '/products', label: 'Our Store' },
    { href: '/services', label: 'Services' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
  ];

  const currencies: SupportedCurrency[] = ['GHS', 'USD', 'EUR', 'GBP'];

  return (
    <div className="sticky top-3 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Floating Pill Capsule with Brand Green Background */}
      <header className="bg-emerald-950/95 backdrop-blur-2xl border border-emerald-500/30 shadow-2xl shadow-slate-950/60 rounded-full px-5 py-2.5 flex items-center justify-between relative transition-all">
        {/* Logo (Left) */}
        <Link href="/" className="flex items-center group pl-1 shrink-0 z-10">
          <Logo className="h-10 group-hover:scale-105 transition-transform duration-300" variant="light" />
        </Link>

        {/* Centered Navigation Menu */}
        <nav className="hidden lg:flex items-center space-x-1 bg-emerald-900/60 p-1 rounded-full border border-emerald-500/30 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/30'
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Currency Selector & Inquiry CTA */}
        <div className="hidden lg:flex items-center space-x-2 z-10">
          {/* Currency Switcher Dropdown */}
          <div className="relative flex items-center bg-emerald-900/80 border border-emerald-500/40 rounded-full px-3 py-1 text-xs text-white">
            <Globe className="w-3.5 h-3.5 text-emerald-300 mr-1.5 shrink-0" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
              className="bg-transparent text-white font-extrabold text-xs focus:outline-none cursor-pointer pr-1"
              aria-label="Select Currency"
            >
              {currencies.map((c) => (
                <option key={c} value={c} className="bg-emerald-950 text-white font-bold">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <a
            href="https://wa.me/233246432493?text=Hello%20Loveridge%20Properties,%20I%20am%20interested%20in%20your%20lands,%20office%20spaces%20and%20warehouses."
            target="_blank"
            rel="noreferrer"
            className="bg-white text-emerald-950 hover:bg-emerald-100 font-black px-5 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-lg shadow-black/20 transition-all active:scale-[0.98]"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-800" /> Inquiry
          </a>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="lg:hidden p-2 rounded-full text-emerald-100 hover:text-white hover:bg-emerald-800/50"
        >
          {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenu && (
        <div className="lg:hidden mt-2 bg-emerald-950/95 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-4 space-y-2 shadow-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenu(false)}
              className="block px-4 py-3 rounded-2xl text-sm font-bold text-emerald-100 hover:bg-emerald-900/80 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin/login"
            onClick={() => setMobileMenu(false)}
            className="block px-4 py-3 rounded-2xl text-sm font-bold text-white bg-emerald-900 border border-emerald-700"
          >
            Staff Admin Portal
          </Link>
        </div>
      )}
    </div>
  );
}
