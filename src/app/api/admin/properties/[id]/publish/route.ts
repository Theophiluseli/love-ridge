import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { logAuditAction } from '@/lib/auth/audit';

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

    await logAuditAction({
      userId: user.userId,
      action: `PROPERTY_${status}`,
      entityType: 'property',
      entityId: id,
      oldValue: { status: existing.status },
      newValue: { status: updated.status },
    });

    return NextResponse.json({ message: `Property status set to ${status}`, property: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update property status.' }, { status: 500 });
  }
}
