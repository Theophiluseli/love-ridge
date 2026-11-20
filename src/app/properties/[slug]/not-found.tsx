import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PropertyNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-800 font-bold text-2xl shadow-sm">
          🏡
        </div>
        <h1 className="text-3xl font-black text-slate-900">Property Listing Not Found</h1>
        <p className="text-slate-600 text-sm max-w-md mx-auto font-medium leading-relaxed">
          This listing may have been sold, rented or taken off the market. Browse our current properties below.
        </p>
        <div>
          <Link
            href="/properties"
            className="gradient-btn px-6 py-3.5 rounded-2xl text-xs font-bold inline-flex items-center gap-2 shadow-md"
          >
            ← Browse All Property Listings
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
