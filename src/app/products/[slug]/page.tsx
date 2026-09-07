import { Metadata } from 'next';
import { getProductBySlug, getRelatedProducts } from '@/lib/products-store';
import ProductDetailClient from '@/components/ProductDetailClient';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const revalidate = 60;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return {
      title: 'Product Not Found | Loveridge Store',
      description: 'The requested product could not be found in our store catalog.',
    };
  }

  const title = `${product.name} | Loveridge Store Ghana`;
  const description = (product.description || '').slice(0, 160);
  const imageUrl = product.imageUrl || '/product_tiles.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl }],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto w-full px-4 py-20 text-center space-y-6">
          <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Product Not Found</h1>
            <p className="text-sm text-slate-600 font-medium">
              The product you are looking for may have been moved, updated, or is no longer listed in our store.
            </p>
          </div>
          <div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-900 text-white rounded-2xl text-xs font-bold hover:bg-emerald-950 transition-colors shadow-md"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Store Products
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const related = await getRelatedProducts(product, 3);

  return <ProductDetailClient product={product} initialSimilar={related} />;
}
