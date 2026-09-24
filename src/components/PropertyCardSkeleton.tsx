'use client';

export default function PropertyCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between h-full border border-slate-200/80 shadow-sm bg-white animate-pulse">
      {/* Property Cover Image Skeleton - Matches Larger Card */}
      <div className="relative h-60 sm:h-72 lg:h-80 xl:h-88 bg-slate-200 overflow-hidden">
        {/* Shimmer Badge at top-left */}
        <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-20 flex gap-2">
          <div className="w-20 h-6 bg-slate-300 rounded-full" />
          <div className="w-24 h-6 bg-slate-300 rounded-full" />
        </div>

        {/* Shimmer Price at bottom-left */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-4 sm:left-4 sm:right-4 z-20 flex items-end justify-between">
          <div className="w-36 h-8 bg-slate-300/90 rounded-lg" />
          <div className="w-24 h-6 bg-slate-300/80 rounded-md" />
        </div>
      </div>

      {/* Property Content Details */}
      <div className="p-5 sm:p-6 lg:p-7 flex-1 flex flex-col justify-between space-y-4 sm:space-y-5">
        <div className="space-y-3">
          {/* Location & Date Bar */}
          <div className="flex items-center justify-between">
            <div className="w-40 h-4 bg-slate-200 rounded" />
            <div className="w-20 h-3.5 bg-slate-200 rounded" />
          </div>

          {/* Title Lines */}
          <div className="w-full h-6 bg-slate-200 rounded" />
          <div className="w-3/4 h-6 bg-slate-200 rounded" />

          {/* Description Snippet */}
          <div className="w-full h-4 bg-slate-100 rounded mt-1.5" />
        </div>

        {/* Specs & Features Skeleton */}
        <div className="pt-3 border-t border-slate-100 space-y-3.5">
          <div className="grid grid-cols-4 gap-2">
            <div className="h-10 bg-slate-100 rounded-xl" />
            <div className="h-10 bg-slate-100 rounded-xl" />
            <div className="h-10 bg-slate-100 rounded-xl" />
            <div className="h-10 bg-slate-100 rounded-xl" />
          </div>

          {/* Button CTA */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="h-11 sm:h-12 bg-slate-200 rounded-xl sm:rounded-2xl" />
            <div className="h-11 sm:h-12 bg-slate-200 rounded-xl sm:rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
