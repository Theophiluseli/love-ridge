import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logAuditAction } from '@/lib/auth/audit';
import { getAllProperties, saveProperty } from '@/lib/properties-store';
import { broadcastCatalogUpdate } from '@/lib/realtime-broadcast';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'property.create');
  if ('response' in auth) return auth.response;

  try {
    const properties = await getAllProperties();
    return NextResponse.json(
      { properties },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
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

    const initialStatus = body.status || 'PUBLISHED';

    if (initialStatus === 'PUBLISHED') {
      if (!title || !listingType || !propertyType || price === undefined || price === null || !locationAddress || !city) {
        return NextResponse.json(
          { error: 'Missing required fields for publishing (title, listingType, propertyType, price, address, city).' },
          { status: 400 }
        );
      }
    } else {
      if (!title) {
        return NextResponse.json(
          { error: 'Please provide a title to save a property draft.' },
          { status: 400 }
        );
      }
    }

    if (body.isFavourite === true || body.favourite === true) {
      const currentProps = await getAllProperties();
      const favCount = currentProps.filter((p) => p.isFavourite).length;
      if (favCount >= 3) {
        return NextResponse.json(
          { error: 'Only 3 properties can be selected as Favourite. Please deselect an existing Favourite first.' },
          { status: 400 }
        );
      }
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

    let assignedAgentId = agentId;
    if (body.contactName) {
      try {
        const { data: agentUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .ilike('name', body.contactName.trim())
          .maybeSingle();
        if (agentUser?.id) {
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
      description: description || 'Property listing description.',
      listingType: listingType || 'SALE',
      propertyType: propertyType || 'HOUSE',
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
      locationAddress: locationAddress || 'Accra',
      city: city || 'Accra',
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
      isFavourite: Boolean(body.isFavourite ?? body.favourite),
      commission: body.commission || '',
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
    };

    // Save to persistent file store, PostgreSQL system_settings and Prisma
    const savedProperty = await saveProperty(propertyPayload);

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

    // Broadcast real-time update to all connected clients
    broadcastCatalogUpdate('properties', 'INSERT').catch(() => null);

    return NextResponse.json({ message: 'Property created successfully', property: savedProperty }, { status: 201 });
  } catch (error) {
    console.error('Create property error:', error);
    return NextResponse.json({ error: 'Failed to create property.' }, { status: 500 });
  }
}

