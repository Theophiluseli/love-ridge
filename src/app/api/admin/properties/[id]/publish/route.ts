import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { logAuditAction } from '@/lib/auth/audit';
import { saveProperty } from '@/lib/properties-store';
import { broadcastCatalogUpdate } from '@/lib/realtime-broadcast';

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

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Property not found.' }, { status: 404 });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        status,
        approvedById: user.userId,
        publishedAt: status === 'PUBLISHED' ? new Date() : existing.publishedAt,
      },
    });

    // Synchronize into properties-store, system_settings, and scratch file
    await saveProperty({
      id,
      status,
      title: existing.title,
      slug: existing.slug,
      description: existing.description,
      listingType: existing.listingType,
      propertyType: existing.propertyType,
      price: existing.price,
      currency: existing.currency,
      bedrooms: existing.bedrooms,
      bathrooms: existing.bathrooms,
      locationAddress: existing.locationAddress,
      city: existing.city,
      region: existing.region,
      featured: existing.featured,
      imageUrl: existing.imageUrl || undefined,
      galleryUrls: existing.galleryUrls || [],
    });

    await logAuditAction({
      userId: user.userId,
      action: `PROPERTY_${status}`,
      entityType: 'property',
      entityId: id,
      oldValue: { status: existing.status },
      newValue: { status: updated.status },
    });

    // Broadcast real-time update
    broadcastCatalogUpdate('properties', 'UPDATE').catch(() => null);

    return NextResponse.json({ message: `Property status set to ${status}`, property: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update property status.' }, { status: 500 });
  }
}
