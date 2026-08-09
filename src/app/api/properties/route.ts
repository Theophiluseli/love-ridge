import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';


const FALLBACK_PROPERTIES = [
  {
    id: 'prop-1',
    title: 'Luxury 4-Bedroom Smart Villa with Swimming Pool',
    slug: 'luxury-4-bedroom-smart-villa-east-legon',
    description: 'Contemporary multi-level smart home in East Legon featuring automated lighting, high security, private pool, and staff quarters.',
    listingType: 'SALE',
    propertyType: 'HOUSE',
    price: 680000,
    currency: 'USD',
    pricePeriod: 'Outright Purchase',
    bedrooms: 4,
    bathrooms: 5,
    sizeSqft: 4500,
    locationAddress: 'East Legon, Accra',
    city: 'Accra',
    featured: true,
    imageUrl: '/property_villa.png',
  },
  {
    id: 'prop-2',
    title: 'Prime Commercial Land Plot in Cantonments Embassy Quarter',
    slug: 'prime-commercial-land-cantonments-embassy-quarter',
    description: '0.85-acre prime development land situated in Cantonments. Ideal for diplomatic embassy build or luxury apartment complex.',
    listingType: 'SALE',
    propertyType: 'LAND',
    price: 1200000,
    currency: 'USD',
    pricePeriod: 'Outright Purchase',
    bedrooms: 0,
    bathrooms: 0,
    sizeSqft: 37000,
    locationAddress: 'Cantonments, Accra',
    city: 'Accra',
    featured: true,
    imageUrl: '/property_land.png',
  },
  {
    id: 'prop-3',
    title: 'High-Bay Logistics & Distribution Warehouse (2,500 sqm)',
    slug: 'high-bay-logistics-distribution-warehouse-tema',
    description: 'Industrial distribution facility in Tema Heavy Industrial Area. High clearance, 3-phase industrial power, dock levelers.',
    listingType: 'RENT',
    propertyType: 'WAREHOUSE',
    price: 15000,
    currency: 'USD',
    pricePeriod: 'Per Month',
    bedrooms: 0,
    bathrooms: 4,
    sizeSqft: 27000,
    locationAddress: 'Tema Heavy Industrial Area',
    city: 'Tema',
    featured: true,
    imageUrl: '/property_warehouse.png',
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const listingType = searchParams.get('listingType'); // SALE, RENT
    const propertyType = searchParams.get('propertyType'); // HOUSE, APARTMENT, LAND, etc.
    const city = searchParams.get('city');
    const bedrooms = searchParams.get('bedrooms');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const featured = searchParams.get('featured');

    const where: any = {
      status: 'PUBLISHED',
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { locationAddress: { contains: search } },
        { city: { contains: search } },
      ];
    }

    if (listingType && listingType !== 'ALL') {
      where.listingType = listingType.toUpperCase();
    }

    if (propertyType && propertyType !== 'ALL') {
      if (propertyType.toUpperCase() === 'COMMERCIAL') {
        where.propertyType = { in: ['LAND', 'OFFICE_SPACE', 'WAREHOUSE'] };
      } else {
        where.propertyType = propertyType.toUpperCase();
      }
    }

    if (city && city !== 'ALL') {
      where.city = city;
    }

    if (bedrooms && bedrooms !== 'ALL') {
      where.bedrooms = { gte: parseInt(bedrooms) };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (featured === 'true') {
      where.featured = true;
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        agent: {
          select: { id: true, name: true, email: true, phone: true },
        },
        amenities: {
          include: { amenity: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ properties, count: properties.length });
  } catch (error) {
    console.error('Error fetching properties, serving fallback:', error);
    const { searchParams } = new URL(req.url);
    const featuredOnly = searchParams.get('featured') === 'true';
    const list = featuredOnly ? FALLBACK_PROPERTIES.filter((p) => p.featured) : FALLBACK_PROPERTIES;
    return NextResponse.json({ properties: list, count: list.length });
  }
}
