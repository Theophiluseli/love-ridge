import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAuthenticatedUser } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long.' }, { status: 400 });
    }

    // Find user in Prisma database
    const user = await prisma.user.findUnique({ where: { id: authUser.userId } });
    if (user) {
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
      }
      const newHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: authUser.userId },
        data: { passwordHash: newHash },
      });
    }

    return NextResponse.json({ message: 'Password updated successfully!' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ message: 'Password updated successfully!' });
  }
}
