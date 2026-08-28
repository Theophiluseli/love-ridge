import { NextRequest, NextResponse } from 'next/server';
import { getAllProperties } from '@/lib/properties-store';

export const dynamic = 'force-dynamic';

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

    // Default to PUBLISHED properties for public route
    properties = properties.filter((p) => p.status === 'PUBLISHED');

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
      if (propertyType.toUpperCase() === 'COMMERCIAL') {
        properties = properties.filter((p) => ['LAND', 'OFFICE_SPACE', 'WAREHOUSE'].includes(p.propertyType.toUpperCase()));
      } else {
        properties = properties.filter((p) => p.propertyType.toUpperCase() === propertyType.toUpperCase());
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
      properties = properties.filter((p) => p.featured);
    }

    return NextResponse.json(
      { properties, count: properties.length },
      {
        headers: {
          'Cache-Control': 'public, max-age=5, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching public properties:', error);
    const properties = await getAllProperties();
    return NextResponse.json({ properties, count: properties.length });
  }
}

