import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { logAuditAction } from '@/lib/auth/audit';
import { saveBusiness, getAllBusinesses } from '@/lib/businesses-store';
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

    const allBusinesses = await getAllBusinesses();
    const existing = allBusinesses.find((b) => b.id === id || b.slug === id);

    if (!existing) {
      return NextResponse.json({ error: 'Business listing not found.' }, { status: 404 });
    }

    const updated = await saveBusiness({
      ...existing,
      id: existing.id,
      status,
    });

    logAuditAction({
      userId: user.userId,
      action: `BUSINESS_${status}`,
      entityType: 'business',
      entityId: existing.id,
      oldValue: { status: existing.status },
      newValue: { status },
    }).catch(() => null);

    broadcastCatalogUpdate('businesses', 'UPDATE').catch(() => null);

    return NextResponse.json({
      message: `Business listing ${status === 'PUBLISHED' ? 'published' : 'saved as draft'} successfully.`,
      business: updated,
    });
  } catch (error) {
    console.error('Publish business error:', error);
    return NextResponse.json({ error: 'Failed to update business status.' }, { status: 500 });
  }
}

