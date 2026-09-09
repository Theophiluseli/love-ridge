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

  // Determine initial image safely based on the actual product
  const getInitialImg = (prod: ProductItem) => {
    if (prod.imageUrl) return prod.imageUrl;
    const lowerName = (prod.name || '').toLowerCase();
    const lowerSlug = (prod.slug || '').toLowerCase();
    if (lowerSlug.includes('drill') || lowerSlug.includes('tool') || lowerName.includes('drill')) {
      return '/product_drill.png';
    }
    if (lowerSlug.includes('lock') || lowerName.includes('lock')) {
      return '/product_lock.png';
    }
    if (lowerSlug.includes('tile') || lowerSlug.includes('marble') || lowerName.includes('tile')) {
      return '/product_tiles.png';
    }
    return prod.imageUrl || '/product_tiles.png';
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
                      <img src={img} alt={`Gallery ${idx + 1}`} loading="lazy" className="w-full h-full object-cover" />
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

            {/* Dual Currency Price Box (Ghana Cedis & Chinese Yuan) */}
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

              {/* Dual Currency Badges (Ghana Cedis & Chinese Yuan) */}
              <div className="pt-2.5 border-t border-emerald-900/10 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                <div className="flex items-center justify-between sm:justify-start gap-2 bg-white border border-emerald-300 px-3 py-2 rounded-xl shadow-2xs w-full">
                  <span className="text-[10px] font-black uppercase text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                    🇬🇭 Cedis
                  </span>
                  <span className="text-xs font-black text-slate-950 whitespace-nowrap">
                    GH₵ {Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-start gap-2 bg-white border border-red-300 px-3 py-2 rounded-xl shadow-2xs w-full">
                  <span className="text-[10px] font-black uppercase text-red-900 bg-red-100 px-2 py-0.5 rounded shrink-0">
                    🇨🇳 China Direct
                  </span>
                  <span className="text-xs font-black text-red-950 whitespace-nowrap">
                    ¥ {Number(product.priceCny || Math.round(product.price * 0.47)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CNY
                  </span>
                </div>
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
                    <span className="text-[11px] font-bold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                      ¥ {((Number(product.priceCny || Math.round(product.price * 0.47))) * quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CNY
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
