export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-800 animate-spin mx-auto" />
        <p className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">Loading Loveridge Platform...</p>
      </div>
    </div>
  );
}
