import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug, getRelatedProducts } from '@/lib/products-store';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const related = await getRelatedProducts(product, 4);

    return NextResponse.json(
      { product, related },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product detail.' }, { status: 500 });
  }
}
