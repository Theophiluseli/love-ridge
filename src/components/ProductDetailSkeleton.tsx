'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Breadcrumb Navigation Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/products" className="hover:text-emerald-800 flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Store Products
            </Link>
            <span>/</span>
            <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
          </div>

          <div className="w-28 h-4 bg-slate-200 rounded animate-pulse" />
        </div>

        {/* Main Product 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Product Image & Gallery Skeleton */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-200/80 rounded-3xl border border-slate-200 flex items-center justify-center h-[320px] sm:h-[460px] animate-pulse" />

            {/* Gallery Thumbnails Skeleton */}
            <div className="space-y-2">
              <div className="w-36 h-3 bg-slate-200 rounded animate-pulse" />
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-20 h-20 rounded-2xl bg-slate-200 border border-slate-200 animate-pulse shrink-0"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Order Action Box Skeleton */}
          <div className="lg:col-span-6 space-y-6 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm animate-pulse">
            <div className="space-y-2.5">
              <div className="w-28 h-4 bg-slate-200 rounded" />
              <div className="w-4/5 h-7 bg-slate-200 rounded" />
              <div className="w-24 h-6 bg-slate-200 rounded-full" />
            </div>

            {/* Dual Currency Price Box Skeleton */}
            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="w-40 h-8 bg-slate-200 rounded" />
                <div className="w-20 h-6 bg-slate-200 rounded-xl" />
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex flex-wrap items-center gap-2.5">
                <div className="w-32 h-7 bg-slate-200 rounded-xl" />
                <div className="w-36 h-7 bg-slate-200 rounded-xl" />
              </div>
            </div>

            {/* Quantity Selector Skeleton */}
            <div className="space-y-2">
              <div className="w-36 h-3.5 bg-slate-200 rounded" />
              <div className="flex flex-wrap items-center gap-4">
                <div className="w-36 h-12 bg-slate-200 rounded-2xl" />
                <div className="w-40 h-8 bg-slate-100 rounded" />
              </div>
            </div>

            {/* Description Skeleton */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="w-48 h-3.5 bg-slate-200 rounded" />
              <div className="w-full h-4 bg-slate-200 rounded" />
              <div className="w-5/6 h-4 bg-slate-200 rounded" />
              <div className="w-3/4 h-4 bg-slate-200 rounded" />
            </div>

            {/* Action Buttons Skeleton */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 h-12 bg-slate-200 rounded-2xl" />
              <div className="w-full sm:w-44 h-12 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Similar Store Items Skeleton */}
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <div className="w-64 h-6 bg-slate-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
