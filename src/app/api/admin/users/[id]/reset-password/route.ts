import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      include: { role: true },
    });

    await logAuditAction({
      userId: currentUser.userId,
      action: 'USER_PASSWORD_RESET',
      entityType: 'user',
      entityId: userId,
      newValue: { email: updatedUser.email },
    });

    return NextResponse.json({
      success: true,
      message: `Password successfully reset for ${updatedUser.name} (${updatedUser.email}).`,
    });
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 });
  }
}
