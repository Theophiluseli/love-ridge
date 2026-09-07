import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/products-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').toLowerCase();
    const categorySlug = searchParams.get('category');
    const stockStatus = searchParams.get('stockStatus');
    const featured = searchParams.get('featured');

    let products = await getAllProducts();

    // Default to PUBLISHED products for public store
    products = products.filter((p) => p.status === 'PUBLISHED');

    if (search) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search)
      );
    }

    if (categorySlug && categorySlug !== 'ALL') {
      products = products.filter((p) => {
        const catSlug = p.category?.slug?.toLowerCase() || '';
        const catName = p.category?.name?.toLowerCase() || '';
        const target = categorySlug.toLowerCase();
        return catSlug.includes(target) || catName.includes(target) || target.includes(catSlug);
      });
    }

    if (stockStatus && stockStatus !== 'ALL') {
      products = products.filter((p) => p.stockStatus === stockStatus);
    }

    if (featured === 'true') {
      products = products.filter((p) => p.featured || p.isFavourite);
    }

    // Sort: Favourites come first (max 3), then newest
    products.sort((a, b) => {
      const aFav = a.isFavourite ? 1 : 0;
      const bFav = b.isFavourite ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return NextResponse.json(
      { products, count: products.length },
      {
        headers: {
          'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching public products:', error);
    let products = await getAllProducts();
    products.sort((a, b) => {
      const aFav = a.isFavourite ? 1 : 0;
      const bFav = b.isFavourite ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
    return NextResponse.json({ products, count: products.length });
  }
}
