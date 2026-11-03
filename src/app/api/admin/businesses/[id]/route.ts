import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { logAuditAction } from '@/lib/auth/audit';
import { saveBusiness, deleteBusiness } from '@/lib/businesses-store';
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

    const updated = await saveBusiness({
      id,
      ...body,
    });

    try {
      await logAuditAction({
        userId: user.userId,
        action: 'BUSINESS_UPDATE',
        entityType: 'business',
        entityId: id,
        newValue: updated,
      });
    } catch (e) {
      // ignore audit log error
    }

    broadcastCatalogUpdate('businesses', 'UPDATE').catch(() => null);

    return NextResponse.json({
      message: 'Business listing updated successfully',
      business: updated,
    });
  } catch (error) {
    console.error('Update business error:', error);
    return NextResponse.json({ error: 'Failed to update business listing.' }, { status: 500 });
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
    await deleteBusiness(id);

    try {
      await logAuditAction({
        userId: user.userId,
        action: 'BUSINESS_DELETE',
        entityType: 'business',
        entityId: id,
      });
    } catch (e) {
      // ignore audit log error
    }

    broadcastCatalogUpdate('businesses', 'DELETE').catch(() => null);

    return NextResponse.json({ message: 'Business listing deleted successfully.' });
  } catch (error) {
    console.error('Delete business error:', error);
    return NextResponse.json({ error: 'Failed to delete business listing.' }, { status: 500 });
  }
}

