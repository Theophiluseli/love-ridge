'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';


export default function WhatsAppWidget() {
  const pathname = usePathname();
  const [whatsappNumber, setWhatsappNumber] = useState('233246432493');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('loveridge_system_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.whatsappNumber) setWhatsappNumber(parsed.whatsappNumber);
      }
    } catch (e) {}
  }, []);

  // Do not display WhatsApp chat widget on admin portal pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const message = 'Hello Loveridge Properties, I would like to make an inquiry regarding your listings & products.';
  const sanitizedNum = whatsappNumber.replace(/[^0-9]/g, '') || '233246432493';
  const link = `https://wa.me/${sanitizedNum}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      title="Chat with Us on WhatsApp"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 bg-[#25D366] hover:bg-[#20ba59] text-white p-3.5 sm:p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group border-2 border-white ring-4 ring-[#25D366]/25"
    >
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-white shrink-0"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.277-.1-.478-.15-.678.15s-.777.98-.953 1.18-.352.227-.652.076a8.2 8.2 0 0 1-2.418-1.492 9.05 9.05 0 0 1-1.673-2.083c-.176-.301-.019-.464.132-.614.135-.135.301-.352.452-.528.15-.176.2-.301.301-.502.1-.2.05-.377-.025-.527s-.678-1.634-.928-2.238c-.244-.588-.492-.508-.678-.518-.176-.009-.377-.009-.578-.009s-.527.075-.803.377c-.276.301-1.054 1.03-1.054 2.512 0 1.482 1.079 2.912 1.23 3.113.15.201 2.124 3.243 5.146 4.549.719.311 1.28.497 1.718.636.722.23 1.378.197 1.897.12.578-.087 1.78-.727 2.03-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.202-.577-.352M12.042 21.67A9.63 9.63 0 0 1 7.12 20.33l-.352-.209-3.652.958.974-3.56-.23-.366a9.63 9.63 0 1 1 8.182 4.517m0-17.67a8.03 8.03 0 0 0-6.84 12.24l.44.701-.58 2.12 2.17-.569.678.402a8.04 8.04 0 1 0 4.132-14.894" />
      </svg>
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap text-xs font-extrabold pr-0 group-hover:pr-2 pl-0 group-hover:pl-2">
        WhatsApp Us
      </span>
    </a>
  );
}
