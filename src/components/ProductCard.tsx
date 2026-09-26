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
    updatedAt?: string | Date;
  };
  onRequestQuote?: (productId: string, productName: string) => void;
}

export default function ProductCard({ product, onRequestQuote }: ProductProps) {
  const { formatPrice } = useCurrency();
  const isInStock = product.stockStatus === 'IN_STOCK' && product.stockQuantity > 0;

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

          {/* Floating Circle "+" Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRequestQuote?.(product.id, product.name);
            }}
            title="Request Quote"
            className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-emerald-900 hover:text-white transition-all group-hover:scale-110 z-10 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Product Details */}
        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 mb-2 leading-snug">
          <Link href={`/products/${product.slug}`}>
            {product.name}
          </Link>
        </h3>
      </div>

      {/* Bottom Price & View Row */}
      <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base lg:text-lg font-black text-slate-900 block truncate">
              {formattedPrice}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-red-800 bg-red-50 border border-red-200/70 px-1.5 py-0.5 rounded">
              ¥{Number((product as any).priceCny || Math.round(product.price * 0.47)).toLocaleString()}
            </span>
          </div>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="bg-emerald-900 hover:bg-emerald-950 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center gap-1.5 shadow-sm hover:shadow transition-all group/link shrink-0 active:scale-95"
        >
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5 text-white/90 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
