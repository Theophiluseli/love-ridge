import { NextResponse } from 'next/server';
import { INITIAL_CATEGORIES_STORE } from '@/lib/products-store';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbPromise = prisma.productCategory.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
    });

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000));
    const categories = await Promise.race([dbPromise, timeoutPromise]);

    if (categories && categories.length > 0) {
      return NextResponse.json({ categories }, {
        headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
      });
    }
  } catch (error) {
    // Ignore error and return instant fallback categories
  }

  return NextResponse.json({ categories: INITIAL_CATEGORIES_STORE }, {
    headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
  });
}
