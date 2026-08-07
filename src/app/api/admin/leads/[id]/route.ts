import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { logAuditAction } from '@/lib/auth/audit';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuthPermission(req, 'leads.manage');
  if ('response' in auth) return auth.response;
  const user = auth.user;

  try {
    const { id } = params;
    const body = await req.json();
    const { status, assignedToId } = body;

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: status ?? existing.status,
        assignedToId: assignedToId !== undefined ? assignedToId : existing.assignedToId,
      },
    });

    await logAuditAction({
      userId: user.userId,
      action: 'LEAD_UPDATE_STATUS',
      entityType: 'lead',
      entityId: id,
      oldValue: { status: existing.status, assignedToId: existing.assignedToId },
      newValue: { status: updated.status, assignedToId: updated.assignedToId },
    });

    return NextResponse.json({ message: 'Lead updated successfully.', lead: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update lead.' }, { status: 500 });
  }
}
