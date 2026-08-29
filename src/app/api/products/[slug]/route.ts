import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/products-store';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const products = await getAllProducts();

    const product = products.find(
      (p) => p.slug.toLowerCase() === slug.toLowerCase() || p.id.toLowerCase() === slug.toLowerCase()
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const related = products
      .filter((p) => p.id !== product.id && p.status === 'PUBLISHED')
      .slice(0, 4);

    return NextResponse.json(
      { product, related },
      {
        headers: {
          'Cache-Control': 'public, max-age=15, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product detail.' }, { status: 500 });
  }
}
