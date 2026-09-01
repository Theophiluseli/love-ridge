'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, LANGUAGES, SupportedLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { language, setLanguage, currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (langCode: SupportedLanguage) => {
    setLanguage(langCode);
    setIsOpen(false);

    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      const isLocalhost = host === 'localhost' || host === '127.0.0.1';
      const rootDomain = host.includes('.') && !isLocalhost ? '.' + host.split('.').slice(-2).join('.') : '';

      if (langCode === 'EN') {
        // Clear all translation cookies across domains
        const domains = ['', host, '.' + host, ...(rootDomain ? [rootDomain] : [])];
        const cookieNames = ['googtrans', 'googtrans_opt'];

        cookieNames.forEach((name) => {
          domains.forEach((d) => {
            const domainAttr = d ? `domain=${d};` : '';
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${domainAttr}`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          });
        });

        const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (combo) {
          combo.value = '';
          combo.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // If the page was previously modified by Google Translate, reload to cleanly restore original text
        if (document.querySelector('html.translated-ltr, html.translated-rtl') || document.querySelector('font.goog-text-highlight') || document.cookie.includes('googtrans')) {
          setTimeout(() => {
            window.location.reload();
          }, 50);
        }
      } else {
        const targetCodeMap: Record<SupportedLanguage, string> = {
          EN: 'en',
          ZH: 'zh-CN',
          ES: 'es',
          JA: 'ja',
          FR: 'fr',
        };

        const targetCode = targetCodeMap[langCode] || 'en';
        const cookieValue = `/en/${targetCode}`;

        document.cookie = `googtrans=${cookieValue}; path=/;`;
        document.cookie = `googtrans=${cookieValue}; domain=${host}; path=/;`;
        if (rootDomain) {
          document.cookie = `googtrans=${cookieValue}; domain=${rootDomain}; path=/;`;
        }

        const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (combo) {
          combo.value = targetCode;
          combo.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Pill Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-1.5 bg-emerald-900/80 hover:bg-emerald-800/90 border border-emerald-500/40 hover:border-emerald-400/60 rounded-full px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs text-white font-extrabold shadow-sm transition-all active:scale-95 shrink-0"
        title="Select Language"
        aria-label="Language selector"
      >
        <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300 shrink-0" />
        <span className="text-[10px] sm:text-[11px] leading-none">{currentLanguage.flag}</span>
        <span className="tracking-wide text-[11px] sm:text-xs font-black">{currentLanguage.code}</span>
        <ChevronDown className={`w-3 h-3 text-emerald-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-emerald-950/98 backdrop-blur-2xl border border-emerald-500/40 rounded-2xl p-1.5 shadow-2xl shadow-slate-950/80 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400/80 border-b border-emerald-800/60 mb-1">
            Select Language
          </div>
          <div className="space-y-0.5">
            {LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code as SupportedLanguage)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                      : 'text-emerald-100 hover:bg-emerald-900/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="leading-tight">{lang.nativeName}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-slate-800 font-bold' : 'text-emerald-300/70 font-medium'}`}>
                        {lang.name}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-slate-950" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
