import { NextResponse } from 'next/server';
import { getAllCategories } from '@/lib/categories-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getAllCategories(true);

    return NextResponse.json(
      { categories, count: categories.length },
      {
        headers: {
          'Cache-Control': 'public, max-age=120, s-maxage=300, stale-while-revalidate=900',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching public categories:', error);
    return NextResponse.json({ categories: [], count: 0 }, { status: 500 });
  }
}
