import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { logAuditAction } from '@/lib/auth/audit';

export const dynamic = 'force-dynamic';

/**
 * Recovery: a Super Admin (users.manage) turns off 2-step login for a staff member who lost
 * their phone. That person can sign in with their password and set it up again.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuthPermission(req, 'users.manage');
  if ('response' in auth) return auth.response;

  const target = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!target) return NextResponse.json({ error: 'User account not found.' }, { status: 404 });

  await prisma.user.update({ where: { id: target.id }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
  logAuditAction({
    userId: auth.user.userId,
    action: 'USER_2FA_RESET',
    entityType: 'user',
    entityId: target.id,
  }).catch(() => null);

  return NextResponse.json({ message: '2-step login has been turned off for this user.' });
}
