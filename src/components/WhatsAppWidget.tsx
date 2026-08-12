'use client';

import { MessageSquare } from 'lucide-react';

export default function WhatsAppWidget() {
  const whatsappNumber = '233240001111';
  const message = 'Hello Loveridge Properties, I would like to make an inquiry regarding your listings & products.';
  const link = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      title="Chat with Us on WhatsApp"
      className="fixed bottom-6 left-6 z-50 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 sm:p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group border-2 border-white ring-4 ring-emerald-600/20"
    >
      <MessageSquare className="w-6 h-6 fill-current text-white" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap text-xs font-extrabold pr-0 group-hover:pr-2 pl-0 group-hover:pl-2">
        WhatsApp Us Now
      </span>
    </a>
  );
}
