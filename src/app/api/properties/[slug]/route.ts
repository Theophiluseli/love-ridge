import { NextRequest, NextResponse } from 'next/server';
import { getAllProperties } from '@/lib/properties-store';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const allProps = await getAllProperties();

    const matched = allProps.find(
      (p) => p.slug.toLowerCase() === slug.toLowerCase() || p.id.toLowerCase() === slug.toLowerCase()
    );

    if (matched) {
      const similar = allProps
        .filter((p) => p.id !== matched.id && p.status === 'PUBLISHED')
        .slice(0, 3);

      return NextResponse.json(
        { property: matched, similar },
        {
          headers: {
            'Cache-Control': 'public, max-age=15, stale-while-revalidate=60',
          },
        }
      );
    }

    // Fallback to Prisma if not found in store
    const property = await prisma.property.findFirst({
      where: {
        OR: [{ slug: slug }, { id: slug }],
      },
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

    const similar = await prisma.property.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: property.id },
        OR: [{ city: property.city }, { propertyType: property.propertyType }],
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
