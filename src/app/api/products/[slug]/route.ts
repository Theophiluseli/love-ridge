import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { include: { parent: true } },
        media: { include: { media: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const related = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: product.id },
        categoryId: product.categoryId,
      },
      take: 4,
      include: { category: true },
    });

    return NextResponse.json({ product, related });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product detail.' }, { status: 500 });
  }
}
