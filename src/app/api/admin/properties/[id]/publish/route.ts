import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase-admin';
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
        const { data: sbProp } = await supabaseAdmin
          .from('properties')
          .select('*')
          .or(`id.eq.${id},slug.eq.${id}`)
          .maybeSingle();

        if (sbProp) {
          storeProp = {
            id: sbProp.id,
            title: sbProp.title,
            slug: sbProp.slug,
            description: sbProp.description,
            listingType: sbProp.listingType,
            propertyType: sbProp.propertyType,
            status: sbProp.status,
            price: sbProp.price,
            currency: sbProp.currency,
            pricePeriod: sbProp.pricePeriod,
            bedrooms: sbProp.bedrooms,
            bathrooms: sbProp.bathrooms,
            guestRooms: sbProp.guestRooms || 0,
            boysQuarters: sbProp.boysQuarters || 0,
            garage: sbProp.garage || 0,
            sizeSqft: sbProp.sizeSqft,
            livingAreaSqft: sbProp.livingAreaSqft,
            locationAddress: sbProp.locationAddress,
            city: sbProp.city,
            region: sbProp.region,
            country: sbProp.country,
            featured: sbProp.featured,
            imageUrl: sbProp.imageUrl,
            galleryUrls: sbProp.galleryUrls || [],
            contactName: sbProp.contactName,
            contactPhone: sbProp.contactPhone,
            contactEmail: sbProp.contactEmail,
            amenities: sbProp.amenities || [],
            createdAt: sbProp.createdAt || new Date().toISOString(),
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
