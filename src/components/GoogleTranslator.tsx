'use client';

import { useEffect } from 'react';
import { useLanguage, SupportedLanguage } from '@/context/LanguageContext';

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

const LANGUAGE_CODE_MAP: Record<SupportedLanguage, string> = {
  EN: 'en',
  ZH: 'zh-CN',
  ES: 'es',
  JA: 'ja',
  FR: 'fr',
};

export default function GoogleTranslator() {
  const { language } = useLanguage();

  useEffect(() => {
    // 1. Initialize Google Translate Script
    if (typeof window !== 'undefined') {
      window.googleTranslateElementInit = () => {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,zh-CN,es,ja,fr',
              autoDisplay: false,
            },
            'google_translate_element'
          );
        }
      };

      if (!document.getElementById('google-translate-script')) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const host = window.location.hostname;
    const isLocalhost = host === 'localhost' || host === '127.0.0.1';
    const rootDomain = host.includes('.') && !isLocalhost ? '.' + host.split('.').slice(-2).join('.') : '';

    if (language === 'EN') {
      // Thoroughly clear and expire all translation cookies
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
    } else {
      const targetCode = LANGUAGE_CODE_MAP[language] || 'en';
      const cookieValue = `/en/${targetCode}`;

      // Set cookie for Google Translate
      document.cookie = `googtrans=${cookieValue}; path=/;`;
      document.cookie = `googtrans=${cookieValue}; domain=${host}; path=/;`;
      if (rootDomain) {
        document.cookie = `googtrans=${cookieValue}; domain=${rootDomain}; path=/;`;
      }

      // Attempt direct combobox trigger if present on page
      const applyComboChange = () => {
        const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (combo) {
          if (combo.value !== targetCode) {
            combo.value = targetCode;
            combo.dispatchEvent(new Event('change', { bubbles: true }));
          }
          return true;
        }
        return false;
      };

      if (!applyComboChange()) {
        const timer = setInterval(() => {
          if (applyComboChange()) {
            clearInterval(timer);
          }
        }, 200);
        setTimeout(() => clearInterval(timer), 2500);
      }
    }
  }, [language]);

  return <div id="google_translate_element" style={{ display: 'none' }} />;
}
