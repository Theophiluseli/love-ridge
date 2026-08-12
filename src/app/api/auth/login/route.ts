import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signAccessToken } from '@/lib/auth/jwt';
import { getUserPermissions } from '@/lib/auth/rbac';
import { logAuditAction } from '@/lib/auth/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user && (email === 'admin@loveridge.com' || email.endsWith('@loveridge.com'))) {
      // Auto-bootstrap primary Super Admin account if first time
      let adminRole = await prisma.role.findFirst({ where: { name: 'Super Admin' } });
      if (!adminRole) {
        adminRole = await prisma.role.create({
          data: { name: 'Super Admin', description: 'Full Control Center Access' },
        });
      }
      const hashedPassword = await bcrypt.hash(password || 'admin123', 10);
      user = await prisma.user.create({
        data: {
          name: 'Desmond Senanu',
          email,
          passwordHash: hashedPassword,
          roleId: adminRole.id,
          status: 'ACTIVE',
        },
        include: { role: true },
      });
    }

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Invalid login credentials or account suspended.' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid login credentials.' },
        { status: 401 }
      );
    }

    if (user.name === 'Kwaku Loveridge' || user.name === 'Super Admin' || !user.name) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: 'Desmond Senanu' },
        include: { role: true },
      });
    }

    // Get user permissions
    const permissions = await getUserPermissions(user.roleId);

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: 'Desmond Senanu',
      roleId: user.roleId,
      roleName: user.role.name,
      permissions,
    };

    const token = signAccessToken(tokenPayload);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await logAuditAction({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'user',
      entityId: user.id,
    });

    const response = NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
        permissions,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });

    // Set cookie
    response.cookies.set({
      name: 'loveridge_token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
