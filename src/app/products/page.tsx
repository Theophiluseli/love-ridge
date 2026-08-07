'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import InquiryModal from '@/components/InquiryModal';
import { Search, SlidersHorizontal, Package } from 'lucide-react';

const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Tiles & Marble Slabs', slug: 'tiles-marble' },
  { id: 'cat-2', name: 'Tools & Construction Equipment', slug: 'tools-equipment' },
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Italian Carrara Porcelain Floor Tiles (60x120cm)',
    slug: 'italian-60x120-porcelain-floor-tiles',
    description: 'Premium nano-polished porcelain floor tiles with authentic Carrara marble pattern. High wear resistance.',
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
  {
    id: 'prod-2',
    name: 'Industrial 20V Brushless Cordless Drill & Impact Driver Set',
    slug: 'industrial-20v-brushless-cordless-drill-kit',
    description: 'Heavy duty construction grade cordless power tool combo kit. Includes 2x 4.0Ah Lithium-ion batteries.',
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
  {
    id: 'prod-3',
    name: 'Smart Biometric Fingerprint & Keypad Front Door Lock',
    slug: 'smart-biometric-fingerprint-front-door-lock',
    description: 'High-security 5-in-1 smart lock. Unlocks via Fingerprint, Mobile App, Passcode, RFID Card, and Key.',
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
];

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<any[]>(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Quote Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    productId?: string;
    itemName?: string;
  }>({ isOpen: false });

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  async function fetchProducts() {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Top Category Pills & Search Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          {/* Category Horizontal Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-emerald-900 text-white shadow-md shadow-emerald-950/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All
            </button>

            {categories.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-5 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-900 text-white shadow-md shadow-emerald-950/20'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Search Bar Input */}
          <div className="relative shrink-0 w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
              placeholder="Search products..."
              className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-700 shadow-sm"
            />
          </div>
        </div>

        {/* Sub-header Product Counter */}
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span>
              Showing <strong className="text-slate-900 font-extrabold">{products.length}</strong> products
            </span>
          </div>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4 max-w-md mx-auto">
            <Package className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-xl font-extrabold text-slate-900">No Products Found</h3>
            <p className="text-xs text-slate-600 font-medium">
              No store products matched your search filter. Try choosing "All" or searching a different term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onRequestQuote={(id, name) =>
                  setModalState({
                    isOpen: true,
                    productId: id,
                    itemName: name,
                  })
                }
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      <InquiryModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false })}
        title="Request Wholesale Bulk Quote"
        type="PRODUCT_QUOTE"
        productId={modalState.productId}
        itemName={modalState.itemName}
      />
    </div>
  );
}
