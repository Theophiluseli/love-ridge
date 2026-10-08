'use client';

import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface ProductProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    sku: string;
    price: number;
    currency?: string;
    unit: string;
    stockQuantity: number;
    stockStatus: string;
    originCountry?: string;
    moq: number;
    category?: { name: string } | null;
    imageUrl?: string | null;
    featured?: boolean;
    popular?: boolean;
    socialPlatform?: string | null;
    socialUrl?: string | null;
    updatedAt?: string | Date;
  };
  onRequestQuote?: (productId: string, productName: string) => void;
}

export default function ProductCard({ product, onRequestQuote }: ProductProps) {
  const { formatPrice } = useCurrency();
  const isInStock = product.stockStatus === 'IN_STOCK' && product.stockQuantity > 0;

  // Social platform styling & configuration for action button
  const rawPlatform = ((product as any).socialPlatform || '').toUpperCase().trim();
  const matchedSocialKey =
    rawPlatform.includes('INSTA') ? 'INSTAGRAM' :
    rawPlatform.includes('FACE') ? 'FACEBOOK' :
    rawPlatform.includes('YOU') || rawPlatform.includes('YT') ? 'YOUTUBE' :
    'TIKTOK';

  const socialConfig = {
    TIKTOK: {
      label: 'TikTok',
      defaultUrl: 'https://www.tiktok.com/@loveridgeproperty?is_from_webapp=1&sender_device=pc',
      className: 'bg-black hover:bg-neutral-800 text-white shadow-2xs',
      icon: (
        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
        </svg>
      ),
    },
    INSTAGRAM: {
      label: 'Instagram',
      defaultUrl: 'https://www.instagram.com/loveridgepropertiesgh/',
      className: 'bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white shadow-2xs',
      icon: (
        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    FACEBOOK: {
      label: 'Facebook',
      defaultUrl: 'https://web.facebook.com/loveridgepropertiesgh',
      className: 'bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-2xs',
      icon: (
        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    YOUTUBE: {
      label: 'YouTube',
      defaultUrl: 'https://www.youtube.com/@loveridgeproperties',
      className: 'bg-[#FF0000] hover:bg-[#d90000] text-white shadow-2xs',
      icon: (
        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  }[matchedSocialKey];

  const resolvedSocialUrl =
    (product as any).socialUrl ||
    (product as any).tiktokUrl ||
    (product as any).videoUrl ||
    socialConfig.defaultUrl;

  // Determine product image (optimized WebP default fallbacks)
  let imgSrc = product.imageUrl;
  if (!imgSrc || imgSrc === '/product_tiles.png') {
    if (product.slug?.includes('tile') || product.slug?.includes('marble') || product.name?.toLowerCase().includes('tile')) {
      imgSrc = '/product_tiles.webp';
    } else if (product.slug?.includes('drill') || product.slug?.includes('tool') || product.name?.toLowerCase().includes('drill')) {
      imgSrc = '/product_drill.webp';
    } else if (product.slug?.includes('lock') || product.name?.toLowerCase().includes('lock')) {
      imgSrc = '/product_lock.webp';
    } else {
      imgSrc = '/product_tiles.webp';
    }
  } else if (imgSrc === '/product_drill.png') {
    imgSrc = '/product_drill.webp';
  } else if (imgSrc === '/product_lock.png') {
    imgSrc = '/product_lock.webp';
  }

  const formattedPrice = formatPrice(product.price, product.currency || 'GHS');

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-700/40 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group h-full relative">
      <div>
        {/* Image Frame Container - Scaled Up */}
        <div className="relative w-full h-52 sm:h-64 lg:h-72 bg-slate-100 rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 border border-slate-100/90">
          {/* Badge at top-left */}
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 flex flex-wrap gap-1.5 pointer-events-none">
            {product.featured && (
              <span className="bg-slate-900 text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-full shadow-sm">
                FEATURED
              </span>
            )}
            {product.stockStatus === 'PRE_ORDER' || product.stockStatus === 'PREORDER' ? (
              <span className="bg-amber-500 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-full shadow-sm">
                Available on Pre-Order
              </span>
            ) : product.stockStatus === 'OUT_OF_STOCK' ? (
              <span className="bg-rose-600 text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-full shadow-sm">
                Out of Stock
              </span>
            ) : (
              <span className="bg-emerald-600 text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-full shadow-sm">
                In Stock
              </span>
            )}
          </div>

          {/* Product Image Link */}
          <Link href={`/products/${product.slug}`} className="block w-full h-full">
            <img
              src={imgSrc}
              alt={product.name}
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;
                const fallback = product.slug?.includes('drill') || product.name?.toLowerCase().includes('drill')
                  ? '/product_drill.webp'
                  : product.slug?.includes('lock') || product.name?.toLowerCase().includes('lock')
                  ? '/product_lock.webp'
                  : '/product_tiles.webp';
                if (!target.src.endsWith(fallback)) {
                  target.src = fallback;
                }
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>

          {/* Floating Price & Request Quote "+" Button Container on Product Image */}
          <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-10 flex items-center gap-1.5 sm:gap-2">
            {/* Price Pill positioned directly to the left of the plus button */}
            <Link
              href={`/products/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-xs hover:bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-slate-200/90 shadow-md flex items-center transition-all hover:scale-105 active:scale-95"
            >
              <span className="text-xs sm:text-sm font-black text-slate-950 tracking-tight">
                {formattedPrice}
              </span>
            </Link>

            {/* Circle "+" Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRequestQuote?.(product.id, product.name);
              }}
              title="Request Quote"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-emerald-900 hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Product Details */}
        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 mb-2 leading-snug">
          <Link href={`/products/${product.slug}`}>
            {product.name}
          </Link>
        </h3>
      </div>

      {/* Bottom Action Row (View Details & Social Media Button) */}
      <div className="pt-2.5 sm:pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        {/* View More */}
        <Link
          href={`/products/${product.slug}`}
          className="bg-emerald-900 hover:bg-emerald-950 text-white text-xs sm:text-sm font-bold py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1 sm:gap-1.5 shadow-sm hover:shadow transition-all group/link active:scale-95 text-center"
        >
          <span className="whitespace-nowrap">View More</span>
          <ArrowRight className="w-3.5 h-3.5 text-white/90 group-hover/link:translate-x-0.5 transition-transform shrink-0" />
        </Link>

        {/* Social Media Button (TikTok / Instagram / Facebook / YouTube) */}
        <a
          href={resolvedSocialUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl sm:rounded-2xl ${socialConfig.className} text-xs sm:text-sm font-bold text-center transition-all duration-200 active:scale-95 cursor-pointer shadow-2xs hover:shadow truncate`}
          title={`View on ${socialConfig.label}`}
          aria-label={`View on ${socialConfig.label}`}
        >
          {socialConfig.icon}
          <span className="truncate">{socialConfig.label}</span>
        </a>
      </div>
    </div>
  );
}
