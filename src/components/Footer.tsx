'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { MapPin, Phone, Mail, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterStatus({
        type: 'error',
        message: 'Please enter a valid email address.',
      });
      return;
    }

    setNewsletterLoading(true);
    setNewsletterStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();

      if (res.ok) {
        setNewsletterStatus({
          type: 'success',
          message: data.message || 'Successfully subscribed! Thank you.',
        });
        setNewsletterEmail('');
      } else {
        setNewsletterStatus({
          type: 'error',
          message: data.error || 'Failed to subscribe. Please try again.',
        });
      }
    } catch {
      setNewsletterStatus({
        type: 'error',
        message: 'Network error. Please try again later.',
      });
    } finally {
      setNewsletterLoading(false);
    }
  }

  return (
    <footer className="bg-slate-100/90 border-t border-slate-200 text-slate-700 pt-12 sm:pt-16">
      {/* Top Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 text-center sm:text-left">
        {/* Col 1: Brand Info & Newsletter */}
        <div className="flex flex-col items-center sm:items-start space-y-4">
          <div className="flex justify-center sm:justify-start w-full">
            <Logo className="h-8 sm:h-10 md:h-12" variant="dark" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1 max-w-sm">
            Loveridge Properties & Consult provides real estate, property valuation and renovation services, as well as international sourcing and shipping of building materials, construction equipment and machinery to clients in Ghana and across Africa.
          </p>

          {/* Subscribe to Newsletter */}
          <div className="w-full pt-1 max-w-sm">
            <h5 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-950 mb-2.5">
              {t('footer.newsletter_title', 'Subscribe to Our Newsletter')}
            </h5>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value);
                      if (newsletterStatus.type) setNewsletterStatus({ type: null, message: '' });
                    }}
                    placeholder="Enter your email address"
                    required
                    disabled={newsletterLoading}
                    aria-label="Email for newsletter subscription"
                    className="w-full bg-white border border-slate-300 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 text-slate-800 text-xs rounded-xl px-3.5 py-2.5 outline-none transition placeholder:text-slate-400 shadow-2xs disabled:opacity-60"
                  />
                </div>
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="px-4 py-2.5 bg-emerald-900 hover:bg-emerald-950 active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md disabled:opacity-60 cursor-pointer shrink-0"
                >
                  {newsletterLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <Send className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
              {newsletterStatus.message && (
                <p
                  className={`text-[11px] font-semibold flex items-center justify-center sm:justify-start gap-1.5 transition-all ${
                    newsletterStatus.type === 'error' ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {newsletterStatus.type === 'error' ? (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{newsletterStatus.message}</span>
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Col 2: Quick Links (Pages from Header) */}
        <div className="flex flex-col items-center sm:items-start lg:items-start lg:justify-self-center lg:mx-auto w-fit sm:w-auto lg:w-fit">
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
              <a href="tel:+233246432493" className="hover:text-emerald-800 transition">
                +233 24 643 2493
              </a>
            </li>
            <li className="flex items-center justify-center sm:justify-start gap-2 text-slate-700">
              <Mail className="w-4 h-4 text-emerald-800 shrink-0" />
              <a href="mailto:info@loveridgeproperty.com" className="hover:text-emerald-800 transition">
                info@loveridgeproperty.com
              </a>
            </li>
          </ul>

          {/* Social Media Channels */}
          <div className="pt-4 flex flex-col items-center sm:items-start w-full">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              {t('footer.follow_us', 'Follow Our Channels')}
            </span>
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@loveridgeproperty?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Loveridge on TikTok"
                title="Follow on TikTok"
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-black hover:text-white hover:border-black hover:shadow-md cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/loveridgepropertiesgh/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Loveridge on Instagram"
                title="Follow on Instagram"
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:border-transparent hover:shadow-md cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://web.facebook.com/loveridgepropertiesgh"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Loveridge on Facebook"
                title="Follow on Facebook"
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] hover:shadow-md cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@loveridgeproperties"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Subscribe to Loveridge on YouTube"
                title="Subscribe on YouTube"
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] hover:shadow-md cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/233246432493"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with Loveridge on WhatsApp"
                title="Chat on WhatsApp"
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] hover:shadow-md cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.156 4.22 4.299-1.127z"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/74940241/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect with Loveridge on LinkedIn"
                title="Connect on LinkedIn"
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] hover:shadow-md cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>
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
