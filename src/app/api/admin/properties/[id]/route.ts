import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { logAuditAction } from '@/lib/auth/audit';
import { saveProperty, deleteProperty, getAllProperties } from '@/lib/properties-store';
import { broadcastCatalogUpdate } from '@/lib/realtime-broadcast';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    if (body.isFavourite === true) {
      const currentProps = await getAllProperties();
      const existing = currentProps.find((p) => p.id === id);
      if (!existing?.isFavourite) {
        const favCount = currentProps.filter((p) => p.isFavourite && p.id !== id).length;
        if (favCount >= 3) {
          if (body.title || body.socialPlatform || body.price || body.listingType) {
            body.isFavourite = false;
          } else {
            return NextResponse.json(
              { error: 'Only 3 properties can be selected as Favourite. Please deselect an existing Favourite first.' },
              { status: 400 }
            );
          }
        }
      }
    }

    const updated = await saveProperty({
      id,
      ...body,
    });

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

    // Broadcast real-time update to all connected clients
    broadcastCatalogUpdate('properties', 'UPDATE').catch(() => null);

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

    // Broadcast real-time update to all connected clients
    broadcastCatalogUpdate('properties', 'DELETE').catch(() => null);

    return NextResponse.json({ message: 'Property deleted successfully.' });
  } catch (error) {
    console.error('Delete property error:', error);
    return NextResponse.json({ error: 'Failed to delete property.' }, { status: 500 });
  }
}

