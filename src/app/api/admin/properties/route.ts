import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission, hasPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { logAuditAction } from '@/lib/auth/audit';

export async function GET(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'property.create');
  if ('response' in auth) return auth.response;
  const user = auth.user;

  try {
    let where: any = {};
    // If agent, limit to own listings unless user has property.approve
    if (user.roleName === 'Agent' && !hasPermission(user, 'property.approve')) {
      where.createdById = user.userId;
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        agent: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ properties });
  } catch (err) {
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

    // Initial status: Defaults to DRAFT so listing appears as Draft on admin dashboard until explicitly published
    const initialStatus = body.status || 'DRAFT';

    let assignedAgentId = agentId;
    if (body.contactName) {
      const agentUser = await prisma.user.findFirst({
        where: { name: { equals: body.contactName, mode: 'insensitive' } },
      });
      if (agentUser) {
        assignedAgentId = agentUser.id;
      } else {
        const agentRole = await prisma.role.findFirst({ where: { name: 'Agent' } }) || await prisma.role.findFirst();
        if (agentRole) {
          const newUser = await prisma.user.create({
            data: {
              name: body.contactName,
              email: `agent.${body.contactName.toLowerCase().replace(/[^a-z0-9]/g, '')}.${Date.now().toString().slice(-4)}@loveridge.com`,
              passwordHash: '$2a$10$7zB3c8W1eG3p9vK2L4x5uOqW8yZ0aB1cC2dE3fG4hI5jK6lM7nO8p',
              roleId: agentRole.id,
              phone: '+233 24 000 1111',
            },
          });
          assignedAgentId = newUser.id;
        }
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

    const property = await prisma.property.create({
      data: {
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
    });

    await logAuditAction({
      userId: user.userId,
      action: 'PROPERTY_CREATE',
      entityType: 'property',
      entityId: property.id,
      newValue: property,
    });

    return NextResponse.json({ message: 'Property created successfully', property }, { status: 201 });
  } catch (error) {
    console.error('Create property error:', error);
    return NextResponse.json({ error: 'Failed to create property.' }, { status: 500 });
  }
}
