'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import InquiryModal from '@/components/InquiryModal';
import SocialShare from '@/components/SocialShare';
import { useCurrency } from '@/context/CurrencyContext';
import { ChevronLeft, Plus, Minus, Truck, ArrowRight, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

const SEED_PRODUCTS: Record<string, any> = {
  'italian-60x120-porcelain-floor-tiles': {
    id: 'prod-1',
    name: 'Italian Carrara Porcelain Floor Tiles (60x120cm)',
    slug: 'italian-60x120-porcelain-floor-tiles',
    description: 'Premium nano-polished porcelain floor tiles with authentic Carrara marble pattern. High wear resistance (PEI IV), water absorption <0.5%, suitable for luxury residential living rooms and commercial foyers.',
    sku: 'TILE-ITA-60120-CAR',
    price: 145.00,
    currency: 'GHS',
    unit: 'per box (1.44 sqm)',
    stockQuantity: 450,
    stockStatus: 'IN_STOCK',
    moq: 20,
    category: { name: 'TILES & MARBLE SLABS' },
    imageUrl: '/product_tiles.png',
    galleryUrls: ['/product_tiles.png', '/product_drill.png', '/product_lock.png'],
    updatedAt: new Date().toISOString(),
  },
  'industrial-20v-brushless-cordless-drill-kit': {
    id: 'prod-2',
    name: 'Industrial 20V Brushless Cordless Drill & Impact Driver Set',
    slug: 'industrial-20v-brushless-cordless-drill-kit',
    description: 'Heavy duty construction grade cordless power tool combo kit. Includes 2x 4.0Ah Lithium-ion batteries, fast charger, 65Nm max torque drill, 180Nm impact driver, and durable hard carry case.',
    sku: 'TOOL-20V-DRILL-KIT',
    price: 1850.00,
    currency: 'GHS',
    unit: 'per set',
    stockQuantity: 35,
    stockStatus: 'PRE_ORDER',
    moq: 1,
    category: { name: 'TOOLS & CONSTRUCTION EQUIPMENT' },
    imageUrl: '/product_drill.png',
    galleryUrls: ['/product_drill.png', '/product_lock.png', '/product_tiles.png'],
    updatedAt: new Date().toISOString(),
  },
  'smart-biometric-fingerprint-front-door-lock': {
    id: 'prod-3',
    name: 'Smart Biometric Fingerprint & Keypad Front Door Lock',
    slug: 'smart-biometric-fingerprint-front-door-lock',
    description: 'High-security 5-in-1 smart lock. Unlocks via Fingerprint, Mobile App (Tuya/Smart Life), Passcode, RFID Card, and Emergency Mechanical Key. Solid stainless steel mortise latch with tamper alarm.',
    sku: 'SEC-SMART-LOCK-01',
    price: 1200.00,
    currency: 'GHS',
    unit: 'per piece',
    stockQuantity: 15,
    stockStatus: 'IN_STOCK',
    moq: 5,
    category: { name: 'TOOLS & CONSTRUCTION EQUIPMENT' },
    imageUrl: '/product_lock.png',
    galleryUrls: ['/product_lock.png', '/product_tiles.png', '/product_drill.png'],
    updatedAt: new Date().toISOString(),
  },
};

const INITIAL_SIMILAR = [
  SEED_PRODUCTS['italian-60x120-porcelain-floor-tiles'],
  SEED_PRODUCTS['industrial-20v-brushless-cordless-drill-kit'],
  SEED_PRODUCTS['smart-biometric-fingerprint-front-door-lock'],
];

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const initialProduct = SEED_PRODUCTS[params?.slug] || SEED_PRODUCTS['italian-60x120-porcelain-floor-tiles'];
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState<any>(initialProduct);
  const [similar, setSimilar] = useState<any[]>(INITIAL_SIMILAR.filter((p) => p.slug !== params?.slug));
  const [modalOpen, setModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  let initialImg = initialProduct.imageUrl || '/product_tiles.png';
  const [selectedImage, setSelectedImage] = useState<string>(initialImg);

  useEffect(() => {
    async function syncData() {
      if (!params?.slug) return;
      try {
        const res = await fetch(`/api/products/${params.slug}`);
        const data = await res.json();
        if (data && data.product) {
          setProduct(data.product);

          let loadedSimilar = data.related || [];
          if (loadedSimilar.length < 4) {
            const allRes = await fetch('/api/products');
            const allData = await allRes.json();
            const pool = (allData.products || []).filter((p: any) => p.id !== data.product.id);
            loadedSimilar = pool.length > 0 ? pool.slice(0, 4) : INITIAL_SIMILAR.filter((p) => p.slug !== data.product.slug);
          }
          setSimilar(loadedSimilar);

          let imgSrc = data.product.imageUrl;
          if (!imgSrc) {
            if (data.product.slug?.includes('drill') || data.product.slug?.includes('tool') || data.product.name?.toLowerCase().includes('drill')) {
              imgSrc = '/product_drill.png';
            } else if (data.product.slug?.includes('lock') || data.product.name?.toLowerCase().includes('lock')) {
              imgSrc = '/product_lock.png';
            } else {
              imgSrc = '/product_tiles.png';
            }
          }
          setSelectedImage(imgSrc);
        }
      } catch (err) {
        console.error('Quiet sync error:', err);
      }
    }
    syncData();
  }, [params?.slug]);

  // Combine product main image + uploaded gallery images strictly
  const uploadedGallery = Array.isArray(product.galleryUrls) ? product.galleryUrls : [];
  const rawList = [
    selectedImage,
    product.imageUrl,
    ...uploadedGallery,
  ].filter(Boolean);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/products" className="hover:text-emerald-800 flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Store Products
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold truncate">{product.name}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated: {formattedUpdateDate}</span>
          </div>
        </div>

        {/* Main Product 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Product Image & Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-center h-[320px] sm:h-[460px] relative overflow-hidden group">
              <img
                src={selectedImage}
                alt={product.name}
                loading="eager"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Interactive Image Gallery Thumbnails */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Product Image Gallery ({allImages.length} Photos)
              </span>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-2xl border bg-white overflow-hidden flex items-center justify-center transition-all shrink-0 ${
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

            {/* Social Share Widget */}
            <SocialShare
              title={product.name}
              summary={`Check out ${product.name} available at Loveridge Store.`}
            />
          </div>

          {/* Right Column: Product Info & Order Action Box */}
          <div className="lg:col-span-6 space-y-6 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 block">
                {product.category?.name || 'STORE INVENTORY'}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 pt-0.5">
                {product.stockStatus === 'PRE_ORDER' || product.stockStatus === 'PREORDER' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-xs font-black">
                    <Clock className="w-4 h-4 text-amber-700" /> Available on Pre-Order
                  </span>
                ) : product.stockStatus === 'OUT_OF_STOCK' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-950 border border-rose-300 text-xs font-bold">
                    Out of Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" /> In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Dual Currency Price Box (Ghana Cedis & Chinese Yuan) */}
            <div className="p-5 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-amber-50/20 rounded-3xl border border-emerald-200/80 shadow-xs space-y-3.5">
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
              <div className="pt-2.5 border-t border-emerald-900/10 flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-1.5 bg-white border border-emerald-300 px-3 py-1.5 rounded-xl shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                    🇬🇭 Ghana Cedis
                  </span>
                  <span className="text-xs font-black text-slate-950">
                    GH₵ {Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 bg-white border border-red-300 px-3 py-1.5 rounded-xl shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-red-900 bg-red-100 px-2 py-0.5 rounded">
                    🇨🇳 China Direct (Yuan / RMB)
                  </span>
                  <span className="text-xs font-black text-red-950">
                    ¥ {Number(product.priceCny || Math.round(product.price * 0.47)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CNY
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Purchase Quantity
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center border border-slate-300/80 rounded-2xl bg-slate-50 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold border border-slate-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-bold text-base text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold border border-slate-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-600 font-semibold space-y-0.5">
                  <div>Total Order Estimate:</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-emerald-900 text-base sm:text-lg font-black">
                      {formattedTotalPrice}
                    </span>
                    <span className="text-xs font-bold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
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
              <p className="text-slate-600 text-sm leading-relaxed font-normal">
                {product.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/233246432493?text=${encodeURIComponent(orderMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="gradient-btn flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md"
              >
                {product.stockStatus === 'PRE_ORDER' || product.stockStatus === 'PREORDER'
                  ? 'Place Pre-Order via WhatsApp'
                  : 'Order via WhatsApp Now'}{' '}
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={() => setModalOpen(true)}
                className="py-3.5 px-6 rounded-2xl border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition text-xs sm:text-sm font-bold text-center"
              >
                Request Quotation
              </button>
            </div>
          </div>
        </div>

        {/* Similar Store Items */}
        {similar.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Related Store Inventory & Building Supplies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
