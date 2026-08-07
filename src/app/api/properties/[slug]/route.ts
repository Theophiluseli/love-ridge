import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const property = await prisma.property.findUnique({
      where: { slug },
      include: {
        agent: {
          select: { id: true, name: true, email: true, phone: true },
        },
        amenities: {
          include: { amenity: true },
        },
        media: {
          include: { media: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found.' }, { status: 404 });
    }

    // Find similar properties in same city/type
    const similar = await prisma.property.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: property.id },
        OR: [
          { city: property.city },
          { propertyType: property.propertyType },
        ],
      },
      take: 3,
      include: { agent: true },
    });

    return NextResponse.json({ property, similar });
  } catch (error) {
    console.error('Error fetching property detail:', error);
    return NextResponse.json({ error: 'Failed to fetch property details.' }, { status: 500 });
  }
}
