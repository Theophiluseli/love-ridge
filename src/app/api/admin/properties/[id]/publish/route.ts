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

    // 1. Find existing property across store & database
    const allProps = await getAllProperties();
    const storeProp = allProps.find((p) => p.id === id || p.slug === id);

    let prismaProp: any = null;
    try {
      prismaProp = await prisma.property.findFirst({
        where: { OR: [{ id }, { slug: id }] },
      });
    } catch (e) {
      // transient db error ignored
    }

    if (!storeProp && !prismaProp) {
      return NextResponse.json({ error: 'Property listing not found.' }, { status: 404 });
    }

    const resolvedId = storeProp?.id || prismaProp?.id || id;
    const currentStatus = storeProp?.status || prismaProp?.status || 'PUBLISHED';

    // 2. Validate approvedById to prevent foreign key violations with fallback admin accounts
    let validApprovedById: string | null = null;
    if (status === 'PUBLISHED' && user.userId && user.userId !== 'admin-fallback-id') {
      try {
        const userCheck = await prisma.user.findUnique({
          where: { id: user.userId },
          select: { id: true },
        });
        if (userCheck) {
          validApprovedById = userCheck.id;
        }
      } catch (e) {}
    }

    // 3. Update status in Prisma
    if (prismaProp) {
      try {
        await prisma.property.update({
          where: { id: resolvedId },
          data: {
            status,
            approvedById: validApprovedById,
            publishedAt: status === 'PUBLISHED' ? new Date() : null,
          },
        });
      } catch (prismaUpdateErr) {
        console.warn('Prisma status update note:', prismaUpdateErr);
      }
    }

    // 4. Update in properties-store, system_settings, and scratch file
    const baseData = storeProp || {
      id: resolvedId,
      title: prismaProp.title,
      slug: prismaProp.slug,
      description: prismaProp.description,
      listingType: prismaProp.listingType,
      propertyType: prismaProp.propertyType,
      price: prismaProp.price,
      currency: prismaProp.currency,
      bedrooms: prismaProp.bedrooms,
      bathrooms: prismaProp.bathrooms,
      locationAddress: prismaProp.locationAddress,
      city: prismaProp.city,
      region: prismaProp.region,
      country: prismaProp.country,
      featured: prismaProp.featured,
      imageUrl: prismaProp.imageUrl,
      galleryUrls: prismaProp.galleryUrls,
    };

    const updated = await saveProperty({
      ...baseData,
      id: resolvedId,
      status,
    });

    try {
      await logAuditAction({
        userId: user.userId,
        action: `PROPERTY_${status}`,
        entityType: 'property',
        entityId: resolvedId,
        oldValue: { status: currentStatus },
        newValue: { status },
      });
    } catch (e) {}

    // 5. Broadcast real-time update
    broadcastCatalogUpdate('properties', 'UPDATE').catch(() => null);

    return NextResponse.json({
      message: status === 'DRAFT' ? 'Property unpublished to Draft.' : 'Property published successfully.',
      property: updated,
    });
  } catch (error: any) {
    console.error('Failed to update property status:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update property status.' },
      { status: 500 }
    );
  }
}
