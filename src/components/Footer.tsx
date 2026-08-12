'use client';

import Link from 'next/link';
import Logo from './Logo';
import { MapPin, Phone, Mail, ArrowRight, ShieldCheck, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-100/90 border-t border-slate-200 text-slate-700 pt-12 sm:pt-16">
      {/* Top Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 text-center sm:text-left">
        {/* Col 1: Brand Info */}
        <div className="flex flex-col items-center sm:items-start space-y-4">
          <div className="flex justify-center sm:justify-start w-full">
            <Logo className="h-10 sm:h-12" variant="dark" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1 max-w-sm">
            Ghana’s premier real estate consultancy for luxury properties and direct imported building materials, porcelain tiles, and smart construction tools.
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 w-full">
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" /> Titled & Verified
            </span>
          </div>
        </div>

        {/* Col 2: Property Search */}
        <div className="flex flex-col items-center sm:items-start">
          <h4 className="text-slate-900 font-extrabold mb-3 sm:mb-4 text-xs uppercase tracking-widest text-emerald-900">
            Property Search
          </h4>
          <ul className="space-y-2.5 text-xs font-medium w-full flex flex-col items-center sm:items-start">
            <li>
              <Link href="/properties?listingType=SALE" className="hover:text-emerald-800 transition flex items-center justify-center sm:justify-start gap-1.5">
                <ArrowRight className="w-3 h-3 text-emerald-700 shrink-0" /> Houses for Sale in East Legon
              </Link>
            </li>
            <li>
              <Link href="/properties?listingType=RENT" className="hover:text-emerald-800 transition flex items-center justify-center sm:justify-start gap-1.5">
                <ArrowRight className="w-3 h-3 text-emerald-700 shrink-0" /> Furnished Apartments for Rent
              </Link>
            </li>
            <li>
              <Link href="/properties?propertyType=LAND" className="hover:text-emerald-800 transition flex items-center justify-center sm:justify-start gap-1.5">
                <ArrowRight className="w-3 h-3 text-emerald-700 shrink-0" /> Titled Commercial Land in Cantonments
              </Link>
            </li>
            <li>
              <Link href="/properties" className="hover:text-emerald-800 transition flex items-center justify-center sm:justify-start gap-1.5">
                <ArrowRight className="w-3 h-3 text-emerald-700 shrink-0" /> All Property Listings
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Our Store */}
        <div className="flex flex-col items-center sm:items-start">
          <h4 className="text-slate-900 font-extrabold mb-3 sm:mb-4 text-xs uppercase tracking-widest text-emerald-900">
            Our Store
          </h4>
          <ul className="space-y-2.5 text-xs font-medium w-full flex flex-col items-center sm:items-start">
            <li>
              <Link href="/products?category=tiles-marble" className="hover:text-emerald-800 transition flex items-center justify-center sm:justify-start gap-1.5">
                <ArrowRight className="w-3 h-3 text-emerald-700 shrink-0" /> Italian Porcelain & Carrara Tiles
              </Link>
            </li>
            <li>
              <Link href="/products?category=tools-equipment" className="hover:text-emerald-800 transition flex items-center justify-center sm:justify-start gap-1.5">
                <ArrowRight className="w-3 h-3 text-emerald-700 shrink-0" /> Power Tools & Safety Gear
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-emerald-800 transition flex items-center justify-center sm:justify-start gap-1.5">
                <ArrowRight className="w-3 h-3 text-emerald-700 shrink-0" /> Request Wholesale Bulk Quote
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-emerald-800 transition flex items-center justify-center sm:justify-start gap-1.5">
                <ArrowRight className="w-3 h-3 text-emerald-700 shrink-0" /> Full Store Catalogue
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact & Staff Access */}
        <div className="flex flex-col items-center sm:items-start">
          <h4 className="text-slate-900 font-extrabold mb-3 sm:mb-4 text-xs uppercase tracking-widest text-emerald-900">
            Office & Staff Access
          </h4>
          <ul className="space-y-3 text-xs font-medium w-full flex flex-col items-center sm:items-start">
            <li className="flex items-center sm:items-start justify-center sm:justify-start gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <span>Lagos Avenue, East Legon, Accra - Ghana</span>
            </li>
            <li className="flex items-center justify-center sm:justify-start gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>+233 (0) 24 000 1111 / +233 (0) 20 222 3333</span>
            </li>
            <li className="flex items-center justify-center sm:justify-start gap-2 text-slate-700">
              <Mail className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>info@loveridgeproperty.com</span>
            </li>
            <li className="pt-2 w-full flex justify-center sm:justify-start">
              <Link
                href="/admin/login"
                className="inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-emerald-900 border border-slate-700 px-4 py-2.5 rounded-xl transition shadow-md w-full sm:w-auto"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Staff Portal / Admin Login
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Lower Footer */}
      <div className="bg-slate-950 border-t border-slate-800 text-slate-400 py-6 px-4 sm:px-6 lg:px-8 text-center text-xs font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <p className="text-slate-400 text-xs font-semibold">
            © {new Date().getFullYear()} LOVERIDGE Properties & Consult. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
