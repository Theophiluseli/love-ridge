import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { logAuditAction } from '@/lib/auth/audit';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuthPermission(req, 'users.manage');
  if ('response' in auth) return auth.response;
  const currentUser = auth.user;

  try {
    const userId = params.id;
    const body = await req.json();
    const { name, phone, roleId, status } = body;

    const data: any = {};
    if (name) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (roleId) data.roleId = roleId;
    if (status) data.status = status;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      include: { role: true },
    });

    await logAuditAction({
      userId: currentUser.userId,
      action: 'USER_UPDATE',
      entityType: 'user',
      entityId: userId,
      newValue: { name: updatedUser.name, role: updatedUser.role.name, status: updatedUser.status },
    });

    const { passwordHash: _, ...sanitized } = updatedUser;
    return NextResponse.json({ message: 'User updated successfully', user: sanitized });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuthPermission(req, 'users.manage');
  if ('response' in auth) return auth.response;
  const currentUser = auth.user;

  try {
    const userId = params.id;
    if (userId === currentUser.userId) {
      return NextResponse.json({ error: 'You cannot delete your own Super Admin account.' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: userId } });

    await logAuditAction({
      userId: currentUser.userId,
      action: 'USER_DELETE',
      entityType: 'user',
      entityId: userId,
    });

    return NextResponse.json({ message: 'User deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user.' }, { status: 500 });
  }
}
