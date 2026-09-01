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
    category?: { name: string };
    imageUrl?: string;
    featured?: boolean;
    popular?: boolean;
    updatedAt?: string | Date;
  };
  onRequestQuote?: (productId: string, productName: string) => void;
}

export default function ProductCard({ product, onRequestQuote }: ProductProps) {
  const { formatPrice } = useCurrency();
  const isInStock = product.stockStatus === 'IN_STOCK' && product.stockQuantity > 0;

  // Determine product image
  let imgSrc = product.imageUrl;
  if (!imgSrc) {
    if (product.slug?.includes('tile') || product.slug?.includes('marble') || product.name?.toLowerCase().includes('tile')) {
      imgSrc = '/product_tiles.png';
    } else if (product.slug?.includes('drill') || product.slug?.includes('tool') || product.name?.toLowerCase().includes('drill')) {
      imgSrc = '/product_drill.png';
    } else if (product.slug?.includes('lock') || product.name?.toLowerCase().includes('lock')) {
      imgSrc = '/product_lock.png';
    } else {
      imgSrc = '/product_tiles.png';
    }
  }

  const formattedPrice = formatPrice(product.price, product.currency || 'GHS');

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group h-full relative">
      <div>
        {/* Image Frame Container */}
        <div className="relative w-full h-44 sm:h-56 bg-slate-100 rounded-xl overflow-hidden mb-2.5 sm:mb-3 border border-slate-100/90">
          {/* Badge at top-left */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 flex flex-wrap gap-1">
            {product.featured && (
              <span className="bg-slate-900 text-white text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full shadow-sm">
                FEATURED
              </span>
            )}
            {product.stockStatus === 'PRE_ORDER' || product.stockStatus === 'PREORDER' ? (
              <span className="bg-amber-500 text-slate-950 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full shadow-sm">
                Available on Pre-Order
              </span>
            ) : product.stockStatus === 'OUT_OF_STOCK' ? (
              <span className="bg-rose-600 text-white text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full shadow-sm">
                Out of Stock
              </span>
            ) : (
              <span className="bg-emerald-600 text-white text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full shadow-sm">
                In Stock
              </span>
            )}
          </div>

          {/* Product Image */}
          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Floating Circle "+" Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onRequestQuote?.(product.id, product.name);
            }}
            title="Request Quote"
            className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-emerald-900 hover:text-white transition-all group-hover:scale-105 z-10"
          >
            <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>

        {/* Product Details */}
        <span className="text-[9px] sm:text-[10px] font-medium tracking-wider uppercase text-emerald-800 mb-1 block truncate">
          {product.category?.name || 'STORE SUPPLIES'}
        </span>

        <h3 className="text-xs sm:text-base font-semibold text-slate-800 group-hover:text-emerald-800 transition-colors line-clamp-1 mb-1 leading-snug">
          {product.name}
        </h3>

        <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2.5 sm:mb-3 font-normal">
          {product.description}
        </p>
      </div>

      {/* Bottom Price & View Row */}
      <div className="pt-2 sm:pt-2.5 border-t border-slate-100 flex items-end justify-between gap-1">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">
              {formattedPrice}
            </span>
            <span className="text-[9px] font-bold text-red-800 bg-red-50 border border-red-200/70 px-1.5 py-0.2 rounded">
              ¥{Number((product as any).priceCny || Math.round(product.price * 0.47)).toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-normal block truncate">
            {product.unit || 'per item'}
          </span>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="text-[11px] sm:text-xs font-medium text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5 sm:gap-1 group/link py-0.5 shrink-0"
        >
          View <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
