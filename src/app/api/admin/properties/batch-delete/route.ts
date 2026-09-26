import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { logAuditAction } from '@/lib/auth/audit';
import { deleteProperty } from '@/lib/properties-store';
import { broadcastCatalogUpdate } from '@/lib/realtime-broadcast';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'property.delete');
  if ('response' in auth) return auth.response;
  const user = auth.user;

  try {
    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No property IDs provided for deletion.' }, { status: 400 });
    }

    let deletedCount = 0;

    for (const id of ids) {
      await deleteProperty(id);
      deletedCount++;

      try {
        await prisma.property.delete({ where: { id } }).catch(() => null);
      } catch (e) {}

      logAuditAction({
        userId: user.userId,
        action: 'PROPERTY_DELETE',
        entityType: 'property',
        entityId: id,
      }).catch(() => null);
    }

    // Broadcast real-time catalog update once
    broadcastCatalogUpdate('properties', 'DELETE').catch(() => null);

    return NextResponse.json({
      message: `Successfully deleted ${deletedCount} properties.`,
      count: deletedCount,
      success: true,
    });
  } catch (error: any) {
    console.error('Batch delete properties error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to batch delete properties.' },
      { status: 500 }
    );
  }
}
