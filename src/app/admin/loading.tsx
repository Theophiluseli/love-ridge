export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse p-4 sm:p-6 lg:p-8">
      {/* Header Skeleton */}
      <div className="space-y-2 border-b border-slate-200 pb-4">
        <div className="h-7 w-64 bg-slate-200 rounded-xl" />
        <div className="h-4 w-96 bg-slate-100 rounded-lg" />
      </div>

      {/* Cards Skeleton Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <div className="h-3 w-28 bg-slate-200 rounded" />
            <div className="h-8 w-16 bg-slate-300 rounded-lg" />
            <div className="h-3 w-36 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Table / Content Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="h-5 w-48 bg-slate-200 rounded-lg" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
