'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy, MessageSquare } from 'lucide-react';

interface SocialShareProps {
  title: string;
  url?: string;
  summary?: string;
}

export default function SocialShare({ title, url, summary }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? (url || window.location.href) : (url || '');
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(summary || title);

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.156 4.22 4.299-1.127z"/>
        </svg>
      ),
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'bg-slate-900 hover:bg-black text-white',
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      ),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'bg-blue-700 hover:bg-blue-800 text-white',
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Share2 className="w-3.5 h-3.5 text-emerald-700" /> Share Listing
        </span>
        <button
          onClick={handleCopy}
          className="text-xs font-bold text-slate-600 hover:text-emerald-800 transition flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" /> Copy Link
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 pt-1 flex-wrap">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs ${link.color}`}
            title={`Share on ${link.name}`}
          >
            {link.icon}
            <span className="hidden sm:inline text-[11px] font-bold">{link.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
