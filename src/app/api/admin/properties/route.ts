import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { logAuditAction } from '@/lib/auth/audit';
import { getAllProperties, saveProperty } from '@/lib/properties-store';

export async function GET(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'property.create');
  if ('response' in auth) return auth.response;

  try {
    const properties = await getAllProperties();
    return NextResponse.json({ properties });
  } catch (err) {
    console.error('Failed to load properties:', err);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'property.create');
  if ('response' in auth) return auth.response;
  const user = auth.user;

  try {
    const body = await req.json();
    const {
      title,
      description,
      listingType,
      propertyType,
      price,
      currency = 'USD',
      pricePeriod,
      bedrooms = 0,
      bathrooms = 0,
      guestRooms = 0,
      boysQuarters = 0,
      garage = 0,
      sizeSqft,
      livingAreaSqft,
      locationAddress,
      city,
      region,
      featured = false,
      agentId,
      imageUrl,
      galleryUrls = [],
    } = body;

    if (!title || !description || !listingType || !propertyType || !price || !locationAddress || !city) {
      return NextResponse.json(
        { error: 'Missing required fields (title, description, listingType, propertyType, price, address, city).' },
        { status: 400 }
      );
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

    const initialStatus = body.status || 'DRAFT';

    let assignedAgentId = agentId;
    if (body.contactName) {
      try {
        const agentUser = await prisma.user.findFirst({
          where: { name: { equals: body.contactName, mode: 'insensitive' } },
        });
        if (agentUser) {
          assignedAgentId = agentUser.id;
        }
      } catch (err) {
        // ignore DB lookup error
      }
    }

    const parseNumberOrNull = (val: any, fallback: number | null = null) => {
      if (val === undefined || val === null || val === '') return fallback;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? fallback : parsed;
    };

    const parseIntOrFallback = (val: any, fallback: number = 0) => {
      if (val === undefined || val === null || val === '') return fallback;
      const parsed = parseInt(val);
      return isNaN(parsed) ? fallback : parsed;
    };

    const propertyPayload = {
      title,
      slug,
      description,
      listingType,
      propertyType,
      status: initialStatus,
      price: parseNumberOrNull(price, 0) || 0,
      currency,
      pricePeriod,
      bedrooms: parseIntOrFallback(bedrooms, 0),
      bathrooms: parseIntOrFallback(bathrooms, 0),
      guestRooms: parseIntOrFallback(guestRooms, 0),
      boysQuarters: parseIntOrFallback(boysQuarters, 0),
      garage: parseIntOrFallback(garage, 0),
      sizeSqft: parseNumberOrNull(sizeSqft, null),
      livingAreaSqft: parseNumberOrNull(livingAreaSqft, null),
      locationAddress,
      city,
      region: region || 'Greater Accra',
      country: 'Ghana',
      featured: Boolean(featured),
      imageUrl: imageUrl || null,
      galleryUrls: Array.isArray(galleryUrls) ? galleryUrls : [],
      contactName: body.contactName || 'Desmond Senanu',
      ownerName: body.ownerName || '',
      ownerPhone: body.ownerPhone || '',
      ownerCompany: body.ownerCompany || '',
      negotiable: Boolean(body.negotiable),
      commission: body.commission || '',
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
    };

    // Save to persistent file store
    const savedProperty = await saveProperty(propertyPayload);

    // Attempt Prisma save as well
    try {
      await prisma.property.create({
        data: {
          id: savedProperty.id,
          title,
          slug,
          description,
          listingType,
          propertyType,
          status: initialStatus,
          price: parseNumberOrNull(price, 0) || 0,
          currency,
          pricePeriod,
          bedrooms: parseIntOrFallback(bedrooms, 0),
          bathrooms: parseIntOrFallback(bathrooms, 0),
          guestRooms: parseIntOrFallback(guestRooms, 0),
          boysQuarters: parseIntOrFallback(boysQuarters, 0),
          garage: parseIntOrFallback(garage, 0),
          sizeSqft: parseNumberOrNull(sizeSqft, null),
          livingAreaSqft: parseNumberOrNull(livingAreaSqft, null),
          locationAddress,
          city,
          region: region || 'Greater Accra',
          country: 'Ghana',
          featured: Boolean(featured),
          imageUrl: imageUrl || null,
          galleryUrls: Array.isArray(galleryUrls) ? galleryUrls : [],
          agentId: assignedAgentId || user.userId,
          createdById: user.userId,
          approvedById: initialStatus === 'PUBLISHED' ? user.userId : null,
          publishedAt: initialStatus === 'PUBLISHED' ? new Date() : null,
        },
      }).catch(() => null);
    } catch (e) {
      // Prisma error ignored
    }

    try {
      await logAuditAction({
        userId: user.userId,
        action: 'PROPERTY_CREATE',
        entityType: 'property',
        entityId: savedProperty.id,
        newValue: savedProperty,
      });
    } catch (e) {
      // audit log error ignored
    }

    return NextResponse.json({ message: 'Property created successfully', property: savedProperty }, { status: 201 });
  } catch (error) {
    console.error('Create property error:', error);
    return NextResponse.json({ error: 'Failed to create property.' }, { status: 500 });
  }
}

