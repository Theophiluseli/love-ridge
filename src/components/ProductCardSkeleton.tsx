'use client';

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between h-full relative animate-pulse">
      <div>
        {/* Image Frame Container Skeleton */}
        <div className="relative w-full h-44 sm:h-56 bg-slate-200 rounded-xl overflow-hidden mb-2.5 sm:mb-3">
          {/* Badge at top-left */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 flex gap-1">
            <div className="w-16 h-4 bg-slate-300 rounded-full" />
            <div className="w-14 h-4 bg-slate-300 rounded-full" />
          </div>

          {/* Floating Circle "+" Button Skeleton */}
          <div className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-300 z-10" />
        </div>

        {/* Product Details Skeleton */}
        <div className="w-20 h-3 bg-slate-200 rounded mb-1.5" />
        <div className="w-full h-4 bg-slate-200 rounded mb-1" />
        <div className="w-2/3 h-4 bg-slate-200 rounded mb-2.5" />
      </div>

      {/* Pricing & MOQ Footer Skeleton */}
      <div className="pt-2 border-t border-slate-100 space-y-1.5">
        <div className="flex items-baseline justify-between">
          <div className="w-20 h-5 bg-slate-200 rounded" />
          <div className="w-12 h-3.5 bg-slate-200 rounded" />
        </div>
        <div className="w-28 h-3 bg-slate-100 rounded" />
      </div>
    </div>
  );
}
