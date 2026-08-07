'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import InquiryModal from '@/components/InquiryModal';
import { ChevronLeft, Plus, Minus, Truck, ArrowRight } from 'lucide-react';
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
    stockStatus: 'IN_STOCK',
    moq: 1,
    category: { name: 'TOOLS & CONSTRUCTION EQUIPMENT' },
    imageUrl: '/product_drill.png',
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
  },
};

const INITIAL_SIMILAR = [
  SEED_PRODUCTS['italian-60x120-porcelain-floor-tiles'],
  SEED_PRODUCTS['industrial-20v-brushless-cordless-drill-kit'],
  SEED_PRODUCTS['smart-biometric-fingerprint-front-door-lock'],
];

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const initialProduct = SEED_PRODUCTS[params?.slug] || SEED_PRODUCTS['italian-60x120-porcelain-floor-tiles'];

  const [product, setProduct] = useState<any>(initialProduct);
  const [similar, setSimilar] = useState<any[]>(INITIAL_SIMILAR.filter((p) => p.slug !== params?.slug));
  const [modalOpen, setModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  let initialImg = initialProduct.imageUrl;
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
            if (data.product.slug.includes('drill') || data.product.slug.includes('tool') || data.product.name.toLowerCase().includes('drill')) {
              imgSrc = '/product_drill.png';
            } else if (data.product.slug.includes('lock') || data.product.name.toLowerCase().includes('lock')) {
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

  // Multi-image gallery list
  const galleryImages = [
    selectedImage,
    selectedImage === '/product_tiles.png' ? '/product_drill.png' : '/product_tiles.png',
  ];

  // Calculated Price according to Quantity
  const unitPrice = product.price;
  const totalPrice = unitPrice * quantity;

  const orderMessage = `Hello Loveridge Store, I would like to place an order for ${quantity} x ${product.name} (SKU: ${product.sku}). Total Amount: GHS ${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Please process my order.`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Main Product 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Product Image & Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200/90 shadow-sm flex items-center justify-center h-[280px] sm:h-[420px] relative overflow-hidden">
              <img
                src={selectedImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain transition-all duration-300"
              />
            </div>

            {/* Image Gallery Thumbnails */}
            <div className="flex items-center gap-3">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-2xl border bg-white p-1.5 flex items-center justify-center transition-all ${
                    selectedImage === img
                      ? 'border-2 border-emerald-900 shadow-sm scale-105'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Product Header & Ordering */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-semibold rounded-md uppercase tracking-wider inline-block">
                {product.category?.name || 'STORE SUPPLIES'}
              </span>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Calculated Price Display */}
              <div className="pt-2 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                    GHS {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    (Total for {quantity} {quantity === 1 ? product.unit : `${product.unit}s`})
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-normal">
                  Unit Price: <span className="font-semibold text-slate-700">GHS {unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> / {product.unit}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-sm font-medium leading-relaxed whitespace-pre-line">
              {product.description}
            </p>

            {/* Quantity Stepper & Add to Order */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* Stepper */}
              <div className="flex items-center gap-4 bg-slate-100/90 rounded-full px-5 py-2.5 border border-slate-200">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-full hover:bg-white text-slate-700 flex items-center justify-center transition shadow-sm"
                  title="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-base font-extrabold text-slate-900 min-w-[24px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded-full hover:bg-white text-slate-700 flex items-center justify-center transition shadow-sm"
                  title="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Order Button */}
              <button
                onClick={() => setModalOpen(true)}
                className="bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold px-8 py-3.5 rounded-full text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/20 transition active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" /> Add to order
              </button>
            </div>

            {/* Nationwide Delivery Badge */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100/90 border border-slate-200 rounded-xl px-4 py-2.5 max-w-sm mt-4">
              <Truck className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>Nationwide delivery across Ghana</span>
            </div>

            {/* Informational Notice Box */}
            <div className="bg-slate-100/80 rounded-2xl p-4 text-xs text-slate-600 font-medium leading-relaxed border border-slate-200/60 max-w-lg">
              Prices are calculated dynamically based on quantity. Click "+ Add to order" to submit your order request directly to our sales team for prompt fulfillment.
            </div>
          </div>
        </div>

        {/* You May Also Need (Related Products) */}
        {similar.length > 0 && (
          <div className="space-y-6 pt-10 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                You may also need
              </h2>
              <Link
                href="/products"
                className="text-xs font-extrabold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 group"
              >
                View category <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {similar.slice(0, 4).map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onRequestQuote={(id, name) => {
                    setModalOpen(true);
                  }}
                />
              ))}
            </div>

            {/* Back to all products */}
            <div className="pt-4">
              <Link
                href="/products"
                className="text-xs text-slate-500 hover:text-emerald-900 font-bold inline-flex items-center gap-1 group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition" /> Back to all products
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <InquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Place Product Order"
        type="PRODUCT_QUOTE"
        productId={product.id}
        itemName={product.name}
        customMessage={orderMessage}
      />
    </div>
  );
}
