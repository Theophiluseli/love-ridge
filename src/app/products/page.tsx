'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import InquiryModal from '@/components/InquiryModal';
import CurrencySwitcher from '@/components/CurrencySwitcher';
import { Search, Package, ChevronDown, Loader2, CheckCircle2 } from 'lucide-react';
import { INITIAL_CATEGORIES_STORE } from '@/lib/products-constants';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

// Module-level client cache for instant category switching and return navigation
const clientProductsCache = new Map<string, any[]>();
let clientCategoriesCache: any[] | null = null;

const INITIAL_PAGE_SIZE = 8;
const PAGE_INCREMENT = 8;

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>(() => {
    const initialKey = `${searchParams.get('category') || 'ALL'}_${searchParams.get('search') || ''}`;
    return clientProductsCache.get(initialKey) || [];
  });
  const [categories, setCategories] = useState<any[]>(() => clientCategoriesCache || INITIAL_CATEGORIES_STORE);
  const [loading, setLoading] = useState<boolean>(() => {
    const initialKey = `${searchParams.get('category') || 'ALL'}_${searchParams.get('search') || ''}`;
    return !clientProductsCache.has(initialKey);
  });

  // Pagination (Load More)
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'ALL');

  // Sync state when URL params change (e.g. clicking footer links)
  useEffect(() => {
    const cat = searchParams.get('category');
    const sSearch = searchParams.get('search');
    setSelectedCategory(cat || 'ALL');
    setSearch(sSearch || '');
  }, [searchParams]);

  // Quote Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    productId?: string;
    itemName?: string;
  }>({ isOpen: false });

  async function loadCategories(forceFresh = false) {
    if (!forceFresh && clientCategoriesCache && clientCategoriesCache.length > 0) {
      setCategories(clientCategoriesCache);
      return;
    }
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
        clientCategoriesCache = data.categories;
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function fetchProducts(forceFresh = false) {
    const cacheKey = `${selectedCategory}_${search.trim().toLowerCase()}`;

    // Instant paint from client cache if available
    if (!forceFresh && clientProductsCache.has(cacheKey)) {
      const cached = clientProductsCache.get(cacheKey)!;
      setProducts(cached);
      setLoading(false);
      return;
    }

    // Only show full skeleton if we have no cached data at all
    if (!clientProductsCache.has(cacheKey)) {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (forceFresh) params.append('_t', Date.now().toString());

      const res = await fetch(`/api/products?${params.toString()}`, forceFresh ? { cache: 'no-store' as RequestCache } : {});
      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        clientProductsCache.set(cacheKey, data.products);
        setProducts(data.products);
      } else {
        clientProductsCache.set(cacheKey, []);
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      if (!clientProductsCache.has(cacheKey)) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }

  // Real-time sync: bust client cache and auto-refetch when any device adds/updates/deletes a product or category
  useRealtimeSync((type) => {
    if (type === 'products') {
      clientProductsCache.clear();
      fetchProducts(true);
    }
    if (type === 'categories') {
      clientCategoriesCache = null;
      loadCategories(true);
    }
  });

  // Reset visible count when category or search changes
  useEffect(() => {
    setVisibleCount(INITIAL_PAGE_SIZE);
  }, [selectedCategory, search]);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  function handleLoadMore() {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_INCREMENT);
      setLoadingMore(false);
    }, 280);
  }

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, search]);

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
              const isActive = selectedCategory === cat.slug || selectedCategory === cat.id;
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

          {/* Search Bar & Currency Switcher Controls */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto shrink-0">
            <CurrencySwitcher />
            <div className="relative flex-1 lg:w-72">
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
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4 max-w-md mx-auto">
            <Package className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-xl font-extrabold text-slate-900">No Products Found</h3>
            <p className="text-xs text-slate-600 font-medium">
              No store products matched your search filter. Try choosing "All" or searching a different term.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {visibleProducts.map((prod) => (
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

            {/* View More Pagination Section (Responsive for Mobile & Desktop) */}
            {products.length > 0 && (
              <div className="pt-6 pb-2 flex flex-col items-center justify-center">
                {/* View More Button or All Caught Up Status */}
                {hasMore ? (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    id="store-load-more-btn"
                    aria-label="View more products"
                    className="w-full sm:w-auto min-w-[200px] px-8 py-3.5 bg-emerald-900 hover:bg-emerald-950 active:scale-[0.98] text-white rounded-full text-xs font-extrabold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 border border-emerald-800 group cursor-pointer disabled:opacity-75"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>View More</span>
                        <ChevronDown className="w-4 h-4 text-amber-400 group-hover:translate-y-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                ) : products.length > INITIAL_PAGE_SIZE ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>You have viewed all {products.length} products</span>
                  </div>
                ) : null}
              </div>
            )}
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

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-800 rounded-full animate-spin" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
