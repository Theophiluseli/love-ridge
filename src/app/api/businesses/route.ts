import { NextRequest, NextResponse } from 'next/server';
import { getAllBusinesses, sanitizeBusinessForPublic } from '@/lib/businesses-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const featured = searchParams.get('featured');

    let businesses = await getAllBusinesses();

    // Default to PUBLISHED businesses for public route
    businesses = businesses.filter((b) => (b.status || 'PUBLISHED').toUpperCase() === 'PUBLISHED');

    if (search) {
      businesses = businesses.filter(
        (b) =>
          b.title.toLowerCase().includes(search) ||
          b.category.toLowerCase().includes(search) ||
          b.location.toLowerCase().includes(search) ||
          b.city.toLowerCase().includes(search) ||
          b.region.toLowerCase().includes(search) ||
          b.description.toLowerCase().includes(search)
      );
    }

    if (category && category !== 'ALL') {
      businesses = businesses.filter(
        (b) => b.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (city && city !== 'ALL') {
      businesses = businesses.filter(
        (b) => b.city.toLowerCase() === city.toLowerCase()
      );
    }

    if (featured === 'true') {
      const feat = businesses.filter((b) => b.featured || b.isFavourite);
      businesses = feat.length > 0 ? feat : businesses.slice(0, 6);
    }

    businesses.sort((a, b) => {
      const aFav = a.isFavourite || a.featured ? 1 : 0;
      const bFav = b.isFavourite || b.featured ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    const publicBusinesses = businesses.map(sanitizeBusinessForPublic);

    const isBust = Boolean(searchParams.get('_t'));
    const cacheHeader = isBust
      ? 'no-store, no-cache, must-revalidate, max-age=0'
      : 'public, s-maxage=10, stale-while-revalidate=59';

    return NextResponse.json(
      { businesses: publicBusinesses, count: publicBusinesses.length },
      {
        headers: {
          'Cache-Control': cacheHeader,
        },
      }
    );
  } catch (error) {
    console.error('Error fetching public businesses:', error);
    return NextResponse.json(
      { businesses: [], count: 0 },
      { status: 500 }
    );
  }
}

