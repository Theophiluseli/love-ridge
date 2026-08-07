import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const categorySlug = searchParams.get('category');
    const stockStatus = searchParams.get('stockStatus');
    const featured = searchParams.get('featured');

    const where: any = {
      status: 'PUBLISHED',
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (categorySlug && categorySlug !== 'ALL') {
      const category = await prisma.productCategory.findUnique({
        where: { slug: categorySlug },
        include: { children: true },
      });

      if (category) {
        const categoryIds = [category.id, ...category.children.map((c) => c.id)];
        where.categoryId = { in: categoryIds };
      }
    }

    if (stockStatus && stockStatus !== 'ALL') {
      where.stockStatus = stockStatus;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        media: { include: { media: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products, count: products.length });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products.' }, { status: 500 });
  }
}
