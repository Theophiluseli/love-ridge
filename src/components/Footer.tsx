'use client';

import Link from 'next/link';
import Logo from './Logo';
import { MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-100/90 border-t border-slate-200 text-slate-700 pt-12 sm:pt-16">
      {/* Top Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 text-center sm:text-left">
        {/* Col 1: Brand Info */}
        <div className="flex flex-col items-center sm:items-start space-y-4">
          <div className="flex justify-center sm:justify-start w-full">
            <Logo className="h-8 sm:h-10 md:h-12" variant="dark" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1 max-w-sm">
            Loveridge Properties & Consult provides real estate, property valuation and renovation services, as well as international sourcing and shipping of building materials, construction equipment and machinery to clients in Ghana and across Africa.
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 w-full">
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" /> Titled & Verified
            </span>
          </div>
        </div>

        {/* Col 2: Quick Links (Pages from Header) */}
        <div className="flex flex-col items-center sm:items-start">
          <h4 className="text-slate-900 font-extrabold mb-3 sm:mb-4 text-xs uppercase tracking-widest text-emerald-900">
            {t('footer.quick_links', 'Quick Links')}
          </h4>
          <ul className="space-y-2.5 text-xs font-medium w-full flex flex-col items-center sm:items-start">
            <li>
              <Link href="/properties" className="hover:text-emerald-800 transition">
                {t('nav.properties', 'Properties & Commercial')}
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-emerald-800 transition">
                {t('nav.store', 'Our Store')}
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-emerald-800 transition">
                {t('nav.services', 'Services')}
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-emerald-800 transition">
                {t('nav.about', 'About Us')}
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="hover:text-emerald-800 transition">
                {t('nav.gallery', 'Gallery')}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-emerald-800 transition">
                {t('nav.contact', 'Contact')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Contact Information */}
        <div className="flex flex-col items-center sm:items-start">
          <h4 className="text-slate-900 font-extrabold mb-3 sm:mb-4 text-xs uppercase tracking-widest text-emerald-900">
            Contact Information
          </h4>
          <ul className="space-y-3 text-xs font-medium w-full flex flex-col items-center sm:items-start">
            <li className="flex items-center sm:items-start justify-center sm:justify-start gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <span>Boundary Road, East Legon, Accra – Ghana</span>
            </li>
            <li className="flex items-center justify-center sm:justify-start gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>+233 24 643 2493</span>
            </li>
            <li className="flex items-center justify-center sm:justify-start gap-2 text-slate-700">
              <Mail className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>info@loveridgeproperty.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Lower Footer */}
      <div className="bg-emerald-950 border-t border-emerald-900/60 text-emerald-100 py-5 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
          <p className="text-emerald-200/90 text-[11px] sm:text-xs font-medium leading-relaxed">
            © {new Date().getFullYear()} Loveridge Properties &amp; Consult. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-1.5 text-[11px] sm:text-xs font-medium">
            <Link
              href="/gallery"
              className="text-emerald-300 hover:text-white transition-colors underline-offset-4 hover:underline whitespace-nowrap"
            >
              Gallery &amp; Expos
            </Link>
            <span className="text-emerald-800 select-none hidden sm:inline">•</span>
            <Link
              href="/privacy-policy"
              className="text-emerald-300 hover:text-white transition-colors underline-offset-4 hover:underline whitespace-nowrap"
            >
              Privacy Policy
            </Link>
            <span className="text-emerald-800 select-none hidden sm:inline">•</span>
            <Link
              href="/terms-and-conditions"
              className="text-emerald-300 hover:text-white transition-colors underline-offset-4 hover:underline whitespace-nowrap"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
