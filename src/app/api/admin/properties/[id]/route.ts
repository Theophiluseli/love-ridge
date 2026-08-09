import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { logAuditAction } from '@/lib/auth/audit';

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

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Property not found.' }, { status: 404 });
    }

    // Row-level authorization check for Agents
    if (user.roleName === 'Agent' && existing.createdById !== user.userId) {
      return NextResponse.json({ error: 'Forbidden. You can only edit your own listings.' }, { status: 403 });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        title: body.title ?? existing.title,
        description: body.description ?? existing.description,
        listingType: body.listingType ?? existing.listingType,
        propertyType: body.propertyType ?? existing.propertyType,
        status: body.status ?? existing.status,
        price: body.price !== undefined ? parseFloat(body.price) : existing.price,
        bedrooms: body.bedrooms !== undefined ? parseInt(body.bedrooms) : existing.bedrooms,
        bathrooms: body.bathrooms !== undefined ? parseInt(body.bathrooms) : existing.bathrooms,
        sizeSqft: body.sizeSqft !== undefined ? parseFloat(body.sizeSqft) : existing.sizeSqft,
        locationAddress: body.locationAddress ?? existing.locationAddress,
        city: body.city ?? existing.city,
        featured: body.featured !== undefined ? Boolean(body.featured) : existing.featured,
        agentId: body.agentId ?? existing.agentId,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : existing.imageUrl,
        galleryUrls: Array.isArray(body.galleryUrls) ? body.galleryUrls : existing.galleryUrls,
      },
    });

    await logAuditAction({
      userId: user.userId,
      action: 'PROPERTY_UPDATE',
      entityType: 'property',
      entityId: id,
      oldValue: existing,
      newValue: updated,
    });

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
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Property not found.' }, { status: 404 });
    }

    await prisma.property.delete({ where: { id } });

    await logAuditAction({
      userId: user.userId,
      action: 'PROPERTY_DELETE',
      entityType: 'property',
      entityId: id,
      oldValue: existing,
    });

    return NextResponse.json({ message: 'Property deleted successfully.' });
  } catch (error) {
    console.error('Delete property error:', error);
    return NextResponse.json({ error: 'Failed to delete property.' }, { status: 500 });
  }
}
