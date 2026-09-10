import { NextRequest, NextResponse } from 'next/server';
import { getAllProperties, sanitizePropertyForPublic } from '@/lib/properties-store';
import { isResidentialProperty } from '@/lib/property-categories';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').toLowerCase();
    const listingType = searchParams.get('listingType'); // SALE, RENT
    const propertyType = searchParams.get('propertyType'); // HOUSE, APARTMENT, LAND, etc.
    const city = searchParams.get('city');
    const bedrooms = searchParams.get('bedrooms');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const featured = searchParams.get('featured');

    let properties = await getAllProperties();

    // Default to PUBLISHED properties for public route (case-insensitive, fallback to PUBLISHED)
    properties = properties.filter((p) => (p.status || 'PUBLISHED').toUpperCase() === 'PUBLISHED');

    if (search) {
      properties = properties.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.locationAddress.toLowerCase().includes(search) ||
          p.city.toLowerCase().includes(search)
      );
    }

    if (listingType && listingType !== 'ALL') {
      properties = properties.filter((p) => p.listingType.toUpperCase() === listingType.toUpperCase());
    }

    if (propertyType && propertyType !== 'ALL') {
      const pUpper = propertyType.toUpperCase();
      if (pUpper === 'COMMERCIAL' || pUpper === 'COMMERCIAL_SPACE') {
        properties = properties.filter((p) =>
          ['LAND', 'OFFICE_SPACE', 'OFFICE', 'WAREHOUSE', 'COMMERCIAL_SPACE', 'RETAIL', 'SHOP'].includes(p.propertyType.toUpperCase()) ||
          !isResidentialProperty(p.propertyType)
        );
      } else {
        properties = properties.filter((p) => p.propertyType.toUpperCase() === pUpper);
      }
    }

    if (city && city !== 'ALL') {
      properties = properties.filter((p) => p.city.toLowerCase() === city.toLowerCase());
    }

    if (bedrooms && bedrooms !== 'ALL') {
      const minBeds = parseInt(bedrooms);
      if (!isNaN(minBeds)) {
        properties = properties.filter((p) => p.bedrooms >= minBeds);
      }
    }

    if (minPrice) {
      const minP = parseFloat(minPrice);
      if (!isNaN(minP)) {
        properties = properties.filter((p) => p.price >= minP);
      }
    }

    if (maxPrice) {
      const maxP = parseFloat(maxPrice);
      if (!isNaN(maxP)) {
        properties = properties.filter((p) => p.price <= maxP);
      }
    }

    if (featured === 'true') {
      properties = properties.filter((p) => p.featured || p.isFavourite);
    }

    // Sort so Favourites occupy the first positions (first 3 roles/rows), followed by newest listings
    properties.sort((a, b) => {
      const aFav = a.isFavourite ? 1 : 0;
      const bFav = b.isFavourite ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    const publicProperties = properties.map(sanitizePropertyForPublic);
    const isBypass = Boolean(searchParams.get('_t'));
    const cacheHeader = isBypass
      ? 'no-store, no-cache, must-revalidate, max-age=0'
      : 'public, s-maxage=15, stale-while-revalidate=59';

    return NextResponse.json(
      { properties: publicProperties, count: publicProperties.length },
      {
        headers: {
          'Cache-Control': cacheHeader,
        },
      }
    );
  } catch (error) {
    console.error('Error fetching public properties:', error);
    let properties = await getAllProperties();
    properties = properties.filter((p) => (p.status || 'PUBLISHED').toUpperCase() === 'PUBLISHED');
    properties.sort((a, b) => {
      const aFav = a.isFavourite ? 1 : 0;
      const bFav = b.isFavourite ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
    const publicProperties = properties.map(sanitizePropertyForPublic);
    return NextResponse.json(
      { properties: publicProperties, count: publicProperties.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=59',
        },
      }
    );
  }
}

