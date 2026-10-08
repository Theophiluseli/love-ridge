'use client';

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between h-full relative animate-pulse">
      <div>
        {/* Image Frame Container Skeleton */}
        <div className="relative w-full h-52 sm:h-64 lg:h-72 bg-slate-200 rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4">
          {/* Badge at top-left */}
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 flex gap-1.5">
            <div className="w-18 h-5 bg-slate-300 rounded-full" />
            <div className="w-16 h-5 bg-slate-300 rounded-full" />
          </div>

          {/* Floating Price & Circle "+" Button Skeleton */}
          <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-10 flex items-center gap-1.5 sm:gap-2">
            <div className="w-20 h-7 sm:h-8 bg-slate-300 rounded-full" />
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-300" />
          </div>
        </div>

        {/* Product Details Skeleton */}
        <div className="w-full h-5 bg-slate-200 rounded mb-1.5" />
        <div className="w-2/3 h-5 bg-slate-200 rounded mb-3" />
      </div>

      {/* Action Buttons Footer Skeleton */}
      <div className="pt-2.5 sm:pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <div className="h-9 sm:h-10 bg-slate-200 rounded-xl sm:rounded-2xl" />
        <div className="h-9 sm:h-10 bg-slate-200 rounded-xl sm:rounded-2xl" />
      </div>
    </div>
  );
}
