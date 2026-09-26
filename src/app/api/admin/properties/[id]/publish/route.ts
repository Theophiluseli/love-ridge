import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { logAuditAction } from '@/lib/auth/audit';
import { saveProperty, getAllProperties } from '@/lib/properties-store';
import { broadcastCatalogUpdate } from '@/lib/realtime-broadcast';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuthPermission(req, 'property.approve');
  if ('response' in auth) return auth.response;
  const user = auth.user;

  try {
    const { id } = params;
    const body = await req.json();
    const { status = 'PUBLISHED' } = body;

    // 1. Find existing property across store & Supabase
    const allProps = await getAllProperties();
    let storeProp = allProps.find((p) => p.id === id || p.slug === id);

    if (!storeProp) {
      try {
        const p: any = await prisma.property.findFirst({
          where: {
            OR: [{ id }, { slug: id }],
          },
        });

        if (p) {
          storeProp = {
            id: p.id,
            title: p.title,
            slug: p.slug,
            description: p.description,
            listingType: p.listingType,
            propertyType: p.propertyType,
            status: p.status,
            price: p.price,
            currency: p.currency,
            pricePeriod: p.pricePeriod,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            guestRooms: p.guestRooms || 0,
            boysQuarters: p.boysQuarters || 0,
            garage: p.garage || 0,
            sizeSqft: p.sizeSqft,
            livingAreaSqft: p.livingAreaSqft,
            locationAddress: p.locationAddress,
            city: p.city,
            region: p.region,
            country: p.country,
            featured: p.featured,
            imageUrl: p.imageUrl,
            galleryUrls: p.galleryUrls || [],
            contactName: p.contactName,
            contactPhone: p.contactPhone,
            contactEmail: p.contactEmail,
            amenities: p.amenities || [],
            createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        // fallback
      }
    }

    if (!storeProp) {
      return NextResponse.json({ error: 'Property listing not found.' }, { status: 404 });
    }

    const resolvedId = storeProp.id;
    const currentStatus = storeProp.status || 'PUBLISHED';

    // 2. Save updated status in store, memory cache, system_settings, and Supabase REST
    const updated = await saveProperty({
      ...storeProp,
      id: resolvedId,
      status,
    });

    // 3. Non-blocking Prisma background sync
    try {
      prisma.property
        .update({
          where: { id: resolvedId },
          data: {
            status,
            publishedAt: status === 'PUBLISHED' ? new Date() : null,
          },
        })
        .catch(() => null);
    } catch (e) {
      // Non-blocking
    }

    // 4. Non-blocking audit log
    logAuditAction({
      userId: user.userId,
      action: `PROPERTY_${status}`,
      entityType: 'property',
      entityId: resolvedId,
      oldValue: { status: currentStatus },
      newValue: { status },
    }).catch(() => null);

    // 5. Broadcast real-time update
    broadcastCatalogUpdate('properties', 'UPDATE').catch(() => null);

    return NextResponse.json({
      message: `Property ${status === 'PUBLISHED' ? 'published' : 'saved as draft'} successfully.`,
      property: updated,
    });
  } catch (error) {
    console.error('Publish property error:', error);
    return NextResponse.json({ error: 'Failed to update property status.' }, { status: 500 });
  }
}
