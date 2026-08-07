import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';


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
      where.listingType = listingType;
    }

    if (propertyType && propertyType !== 'ALL') {
      where.propertyType = propertyType;
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
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties.' }, { status: 500 });
  }
}
