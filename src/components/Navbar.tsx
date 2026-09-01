'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PhoneCall, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import CurrencySwitcher from './CurrencySwitcher';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenu, setMobileMenu] = useState(false);
  const { t } = useLanguage();

  const navLinks = [
    { href: '/', label: t('nav.home', 'Home') },
    { href: '/properties', label: t('nav.properties', 'Properties & Commercial') },
    { href: '/products', label: t('nav.store', 'Our Store') },
    { href: '/services', label: t('nav.services', 'Services') },
    { href: '/about', label: t('nav.about', 'About Us') },
    { href: '/contact', label: t('nav.contact', 'Contact') },
  ];

  return (
    <div className="sticky top-2 sm:top-3 z-50 px-2 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Floating Pill Capsule with Brand Green Background */}
      <header className="bg-emerald-950/95 backdrop-blur-2xl border border-emerald-500/30 shadow-2xl shadow-slate-950/60 rounded-full px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between relative transition-all">
        {/* Logo (Left) */}
        <Link href="/" className="flex items-center group pl-0.5 sm:pl-1 shrink-0 z-10">
          <Logo className="h-8 sm:h-10 group-hover:scale-105 transition-transform duration-300" variant="light" />
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

        {/* Right Actions: Language Selector & Currency Switcher */}
        <div className="hidden lg:flex items-center space-x-2 z-10">
          {/* Language Switcher Dropdown */}
          <LanguageSwitcher />

          {/* Currency Switcher Dropdown */}
          <CurrencySwitcher />
        </div>

        {/* Mobile menu trigger & controls */}
        <div className="lg:hidden flex items-center gap-1 sm:gap-2 shrink-0">
          <LanguageSwitcher className="shrink-0" />
          <CurrencySwitcher className="shrink-0" />
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="p-1.5 sm:p-2 rounded-full text-emerald-100 hover:text-white hover:bg-emerald-800/50 shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
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
            {t('nav.admin', 'Staff Admin Portal')}
          </Link>
        </div>
      )}
    </div>
  );
}
