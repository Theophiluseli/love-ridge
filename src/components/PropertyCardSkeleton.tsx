'use client';

export default function PropertyCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between h-full border border-slate-200/80 shadow-sm bg-white animate-pulse">
      {/* Property Cover Image Skeleton */}
      <div className="relative h-48 sm:h-64 bg-slate-200 overflow-hidden">
        {/* Shimmer Badge at top-left */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex gap-2">
          <div className="w-16 h-5 bg-slate-300 rounded-full" />
          <div className="w-20 h-5 bg-slate-300 rounded-full" />
        </div>

        {/* Shimmer Price at bottom-left */}
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20 flex items-end justify-between">
          <div className="w-28 h-7 bg-slate-300/80 rounded-lg" />
          <div className="w-24 h-5 bg-slate-300/80 rounded-md" />
        </div>
      </div>

      {/* Property Content Details */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
        <div className="space-y-2.5">
          {/* Location & Date Bar */}
          <div className="flex items-center justify-between">
            <div className="w-32 h-3.5 bg-slate-200 rounded" />
            <div className="w-16 h-3 bg-slate-200 rounded" />
          </div>

          {/* Title Lines */}
          <div className="w-full h-5 bg-slate-200 rounded" />
          <div className="w-3/4 h-5 bg-slate-200 rounded" />

          {/* Description Snippet */}
          <div className="w-full h-3.5 bg-slate-100 rounded mt-1" />
        </div>

        {/* Specs & Features Skeleton */}
        <div className="pt-3 border-t border-slate-100/90 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="h-8 bg-slate-100 rounded-xl" />
            <div className="h-8 bg-slate-100 rounded-xl" />
            <div className="h-8 bg-slate-100 rounded-xl" />
          </div>

          {/* Button CTA */}
          <div className="h-10 bg-slate-200 rounded-xl w-full mt-2" />
        </div>
      </div>
    </div>
  );
}
