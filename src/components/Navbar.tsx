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
    { href: '/gallery', label: t('nav.gallery', 'Gallery') },
    { href: '/contact', label: t('nav.contact', 'Contact') },
  ];

  return (
    <div className="sticky top-2 sm:top-3 z-50 px-2 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Floating Pill Capsule with Brand Green Background */}
      <header className="bg-emerald-950/95 backdrop-blur-2xl border border-emerald-500/30 shadow-2xl shadow-slate-950/60 rounded-full px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between relative transition-all">
        {/* Logo (Left) */}
        <Link href="/" className="flex items-center group pl-0.5 sm:pl-1 shrink-0 z-10">
          <Logo className="h-7 sm:h-8 md:h-10 group-hover:scale-105 transition-transform duration-300" variant="light" />
        </Link>

        {/* Centered Navigation Menu */}
        <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 bg-emerald-900/60 p-1 rounded-full border border-emerald-500/30 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-full text-[11px] xl:text-xs font-bold transition-all whitespace-nowrap ${
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
          <LanguageSwitcher />
          <CurrencySwitcher />
        </div>

        {/* Mobile menu trigger & controls */}
        <div className="lg:hidden flex items-center gap-1 sm:gap-2 shrink-0">
          <LanguageSwitcher className="shrink-0" />
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
        <div className="lg:hidden mt-2 bg-emerald-950/95 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-4 sm:p-5 space-y-3 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3 px-2">
            <Logo className="h-7" variant="light" />
            <span className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-widest">Navigation</span>
          </div>
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenu(false)}
                  className={`block px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/30'
                      : 'text-emerald-100 hover:bg-emerald-900/80 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
