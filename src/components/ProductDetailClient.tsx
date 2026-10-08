'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import InquiryModal from '@/components/InquiryModal';
import SocialShare from '@/components/SocialShare';
import { useCurrency } from '@/context/CurrencyContext';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { ChevronLeft, Plus, Minus, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import Link from 'next/link';
import { ProductItem } from '@/lib/products-constants';

interface ProductDetailClientProps {
  product: ProductItem;
  initialSimilar: ProductItem[];
}

export default function ProductDetailClient({
  product: initialProduct,
  initialSimilar,
}: ProductDetailClientProps) {
  const { formatPrice } = useCurrency();
  const [product, setProduct] = useState<ProductItem>(initialProduct);
  const [similar, setSimilar] = useState<ProductItem[]>(initialSimilar);
  const [modalOpen, setModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Determine initial image safely based on the actual product (WebP optimized)
  const getInitialImg = (prod: ProductItem) => {
    if (prod.imageUrl) return prod.imageUrl;
    const lowerName = (prod.name || '').toLowerCase();
    const lowerSlug = (prod.slug || '').toLowerCase();
    if (lowerSlug.includes('drill') || lowerSlug.includes('tool') || lowerName.includes('drill')) {
      return '/product_drill.webp';
    }
    if (lowerSlug.includes('lock') || lowerName.includes('lock')) {
      return '/product_lock.webp';
    }
    if (lowerSlug.includes('tile') || lowerSlug.includes('marble') || lowerName.includes('tile')) {
      return '/product_tiles.webp';
    }
    return prod.imageUrl || '/product_tiles.webp';
  };

  const [selectedImage, setSelectedImage] = useState<string>(getInitialImg(initialProduct));

  // Keep state in sync if initialProduct changes (e.g. client router navigation)
  useEffect(() => {
    setProduct(initialProduct);
    setSelectedImage(getInitialImg(initialProduct));
    setSimilar(initialSimilar);
  }, [initialProduct, initialSimilar]);

  // Real-time catalog updates: refresh product data if edited in admin
  useRealtimeSync((type) => {
    if (type === 'products') {
      fetch(`/api/products/${product.slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.product) {
            setProduct(data.product);
            if (data.related) setSimilar(data.related);
          }
        })
        .catch(() => null);
    }
  });

  // Combine product main image + gallery images strictly
  const uploadedGallery = Array.isArray(product.galleryUrls) ? product.galleryUrls : [];
  const rawList = [
    selectedImage,
    product.imageUrl,
    ...uploadedGallery,
  ].filter(Boolean) as string[];

  const allImages = Array.from(
    new Set(rawList.length > 0 ? rawList : [selectedImage || '/product_tiles.png'].filter(Boolean))
  );

  // Calculated Price according to Quantity
  const unitPrice = product.price;
  const totalPrice = unitPrice * quantity;

  const formattedUnitPrice = formatPrice(unitPrice, product.currency || 'GHS');
  const formattedTotalPrice = formatPrice(totalPrice, product.currency || 'GHS');

  const updatedDate = product.updatedAt || product.createdAt;
  const formattedUpdateDate = updatedDate
    ? new Date(updatedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Recently Updated';

  const orderMessage = `Hello Loveridge Store, I would like to place an order for ${quantity} x ${product.name} (SKU: ${product.sku}). Total Amount: ${formattedTotalPrice}. Please process my order.`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between overflow-x-hidden w-full">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12 min-w-0">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-500 min-w-0">
            <Link href="/products" className="hover:text-emerald-800 flex items-center gap-1 shrink-0 font-bold">
              <ChevronLeft className="w-4 h-4 shrink-0" /> Store Products
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold truncate min-w-0">
              {product.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 font-medium shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Updated: {formattedUpdateDate}</span>
          </div>
        </div>

        {/* Main Product 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start w-full min-w-0">
          {/* Left Column: Product Image & Gallery */}
          <div className="lg:col-span-6 space-y-4 w-full min-w-0">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-center h-[280px] xs:h-[340px] sm:h-[460px] relative overflow-hidden group">
              <img
                src={selectedImage}
                alt={product.name}
                loading="eager"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = '/product_tiles.webp';
                  if (!target.src.endsWith(fallback)) {
                    target.src = fallback;
                  }
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Interactive Image Gallery Thumbnails */}
            {allImages.length > 1 && (
              <div className="space-y-2 w-full min-w-0">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Product Image Gallery ({allImages.length} Photos)
                </span>
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 max-w-full min-w-0">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl border bg-white overflow-hidden flex items-center justify-center transition-all shrink-0 ${
                        selectedImage === img
                          ? 'border-2 border-emerald-800 shadow-sm scale-105 ring-2 ring-emerald-800/20'
                          : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Gallery ${idx + 1}`}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallback = '/product_tiles.webp';
                          if (!target.src.endsWith(fallback)) {
                            target.src = fallback;
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Social Share Widget */}
            <SocialShare
              title={product.name}
              summary={`Check out ${product.name} available at Loveridge Store.`}
            />
          </div>

          {/* Right Column: Product Info & Order Action Box */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 bg-white p-4 sm:p-7 lg:p-10 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm w-full min-w-0">
            <div className="space-y-2">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-emerald-800 block">
                {product.category?.name || 'STORE INVENTORY'}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug break-words">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                {product.stockStatus === 'PRE_ORDER' || product.stockStatus === 'PREORDER' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-xs font-black">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0" /> Available on Pre-Order
                  </span>
                ) : product.stockStatus === 'OUT_OF_STOCK' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-950 border border-rose-300 text-xs font-bold">
                    Out of Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" /> In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-amber-50/20 rounded-2xl sm:rounded-3xl border border-emerald-200/80 shadow-xs space-y-3.5 w-full min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline flex-wrap gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {formattedUnitPrice}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">/ {product.unit || 'per item'}</span>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
                  MOQ: {product.moq} {product.unit}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Purchase Quantity
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                <div className="flex items-center border border-slate-300/80 rounded-2xl bg-slate-50 p-1 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold border border-slate-200 active:scale-95 transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-14 sm:w-16 text-center font-bold text-base text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold border border-slate-200 active:scale-95 transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-600 font-semibold space-y-1">
                  <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Total Order Estimate:</div>
                  <div className="flex items-baseline flex-wrap gap-2">
                    <span className="text-emerald-900 text-lg sm:text-xl font-black">
                      {formattedTotalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Product Overview & Material Specifications
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed font-normal whitespace-pre-line break-words">
                {product.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/233246432493?text=${encodeURIComponent(orderMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="gradient-btn w-full sm:flex-1 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-98 text-center"
              >
                <span>
                  {product.stockStatus === 'PRE_ORDER' || product.stockStatus === 'PREORDER'
                    ? 'Place Pre-Order via WhatsApp'
                    : 'Order via WhatsApp Now'}
                </span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </a>

              {/* Social Media Showcase Button */}
              {(() => {
                const rawPlat = ((product as any).socialPlatform || '').toUpperCase().trim();
                const matchedKey =
                  rawPlat.includes('INSTA') ? 'INSTAGRAM' :
                  rawPlat.includes('FACE') ? 'FACEBOOK' :
                  rawPlat.includes('YOU') || rawPlat.includes('YT') ? 'YOUTUBE' :
                  'TIKTOK';

                const cfg = {
                  TIKTOK: {
                    label: 'Watch on TikTok',
                    url: (product as any).socialUrl || 'https://www.tiktok.com/@loveridgeproperty?is_from_webapp=1&sender_device=pc',
                    cls: 'bg-black hover:bg-neutral-800 text-white',
                    icon: (
                      <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                      </svg>
                    ),
                  },
                  INSTAGRAM: {
                    label: 'Watch on Instagram',
                    url: (product as any).socialUrl || 'https://www.instagram.com/loveridgepropertiesgh/',
                    cls: 'bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white',
                    icon: (
                      <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    ),
                  },
                  FACEBOOK: {
                    label: 'View on Facebook',
                    url: (product as any).socialUrl || 'https://web.facebook.com/loveridgepropertiesgh',
                    cls: 'bg-[#1877F2] hover:bg-[#166fe5] text-white',
                    icon: (
                      <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    ),
                  },
                  YOUTUBE: {
                    label: 'Watch on YouTube',
                    url: (product as any).socialUrl || 'https://www.youtube.com/@loveridgeproperties',
                    cls: 'bg-[#FF0000] hover:bg-[#d90000] text-white',
                    icon: (
                      <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    ),
                  },
                }[matchedKey];

                return (
                  <a
                    href={cfg.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full sm:w-auto py-3.5 px-5 rounded-2xl ${cfg.cls} text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-98`}
                  >
                    {cfg.icon}
                    <span>{cfg.label}</span>
                  </a>
                );
              })()}

              <button
                onClick={() => setModalOpen(true)}
                className="w-full sm:w-auto py-3.5 px-6 rounded-2xl border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition text-xs sm:text-sm font-bold text-center active:scale-98"
              >
                Request Quotation
              </button>
            </div>
          </div>
        </div>

        {/* Similar Store Items */}
        {similar.length > 0 && (
          <div className="space-y-4 sm:space-y-6 pt-6 sm:pt-8 border-t border-slate-200 w-full min-w-0">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Related Store Inventory & Supplies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {similar.map((sim) => (
                <ProductCard key={sim.id} product={sim} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />

      <InquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Request Official Quote"
        type="PRODUCT_QUOTE"
        productId={product.id}
        itemName={product.name}
      />
    </div>
  );
}
