'use client';

import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';

interface ProductProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    sku: string;
    price: number;
    currency: string;
    unit: string;
    stockQuantity: number;
    stockStatus: string;
    originCountry?: string;
    moq: number;
    category?: { name: string };
    imageUrl?: string;
    popular?: boolean;
  };
  onRequestQuote?: (productId: string, productName: string) => void;
}

export default function ProductCard({ product, onRequestQuote }: ProductProps) {
  const isInStock = product.stockStatus === 'IN_STOCK' && product.stockQuantity > 0;

  // Determine product image
  let imgSrc = product.imageUrl;
  if (!imgSrc) {
    if (product.slug.includes('tile') || product.slug.includes('marble') || product.name.toLowerCase().includes('tile')) {
      imgSrc = '/product_tiles.png';
    } else if (product.slug.includes('drill') || product.slug.includes('tool') || product.name.toLowerCase().includes('drill')) {
      imgSrc = '/product_drill.png';
    } else if (product.slug.includes('lock') || product.name.toLowerCase().includes('lock')) {
      imgSrc = '/product_lock.png';
    } else {
      imgSrc = '/product_tiles.png';
    }
  }

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group h-full relative">
      <div>
        {/* Image Frame Container */}
        <div className="relative w-full h-36 sm:h-52 bg-slate-50/80 rounded-xl p-2.5 sm:p-4 flex items-center justify-center overflow-hidden mb-2.5 sm:mb-3 border border-slate-100/90">
          {/* Badge at top-left */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10">
            {isInStock ? (
              <span className="bg-amber-400/90 text-slate-900 text-[9px] sm:text-[10px] font-semibold tracking-wide px-2 sm:px-2.5 py-0.5 rounded-full shadow-2xs">
                Popular
              </span>
            ) : (
              <span className="bg-emerald-900 text-white text-[9px] sm:text-[10px] font-semibold tracking-wide px-2 sm:px-2.5 py-0.5 rounded-full shadow-2xs">
                Pre-Order
              </span>
            )}
          </div>

          {/* Product Image */}
          <img
            src={imgSrc}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
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
          <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
            GHS {product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
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
