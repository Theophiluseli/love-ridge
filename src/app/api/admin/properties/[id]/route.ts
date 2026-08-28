import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { logAuditAction } from '@/lib/auth/audit';
import { saveProperty, deleteProperty } from '@/lib/properties-store';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuthPermission(req, 'property.edit');
  if ('response' in auth) return auth.response;
  const user = auth.user;

  try {
    const { id } = params;
    const body = await req.json();

    const updated = await saveProperty({
      id,
      ...body,
    });

    try {
      await prisma.property.update({
        where: { id },
        data: {
          title: body.title,
          description: body.description,
          listingType: body.listingType,
          propertyType: body.propertyType,
          status: body.status,
          price: body.price !== undefined ? parseFloat(body.price) : undefined,
          bedrooms: body.bedrooms !== undefined ? parseInt(body.bedrooms) : undefined,
          bathrooms: body.bathrooms !== undefined ? parseInt(body.bathrooms) : undefined,
          guestRooms: body.guestRooms !== undefined ? parseInt(body.guestRooms) : undefined,
          boysQuarters: body.boysQuarters !== undefined ? parseInt(body.boysQuarters) : undefined,
          garage: body.garage !== undefined ? parseInt(body.garage) : undefined,
          sizeSqft: body.sizeSqft !== undefined ? parseFloat(body.sizeSqft) : undefined,
          livingAreaSqft: body.livingAreaSqft !== undefined ? parseFloat(body.livingAreaSqft) : undefined,
          locationAddress: body.locationAddress,
          city: body.city,
          featured: body.featured !== undefined ? Boolean(body.featured) : undefined,
          imageUrl: body.imageUrl,
          galleryUrls: body.galleryUrls,
        },
      }).catch(() => null);
    } catch (e) {
      // ignore DB update error
    }

    try {
      await logAuditAction({
        userId: user.userId,
        action: 'PROPERTY_UPDATE',
        entityType: 'property',
        entityId: id,
        newValue: updated,
      });
    } catch (e) {
      // ignore audit log error
    }

    return NextResponse.json({ message: 'Property updated successfully', property: updated });
  } catch (error) {
    console.error('Update property error:', error);
    return NextResponse.json({ error: 'Failed to update property.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuthPermission(req, 'property.delete');
  if ('response' in auth) return auth.response;
  const user = auth.user;

  try {
    const { id } = params;
    await deleteProperty(id);

    try {
      await logAuditAction({
        userId: user.userId,
        action: 'PROPERTY_DELETE',
        entityType: 'property',
        entityId: id,
      });
    } catch (e) {
      // ignore audit log error
    }

    return NextResponse.json({ message: 'Property deleted successfully.' });
  } catch (error) {
    console.error('Delete property error:', error);
    return NextResponse.json({ error: 'Failed to delete property.' }, { status: 500 });
  }
}

