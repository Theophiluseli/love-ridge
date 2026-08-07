import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { logAuditAction } from '@/lib/auth/audit';

export async function GET(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'users.manage');
  if ('response' in auth) return auth.response;

  try {
    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });

    // Remove password hash from response
    const sanitized = users.map((u) => {
      const { passwordHash, ...rest } = u;
      return rest;
    });

    return NextResponse.json({ users: sanitized });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'users.manage');
  if ('response' in auth) return auth.response;
  const currentUser = auth.user;

  try {
    const body = await req.json();
    const { name, email, phone, password, roleId, status = 'ACTIVE' } = body;

    if (!name || !email || !password || !roleId) {
      return NextResponse.json({ error: 'Name, email, password, and roleId are required.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        roleId,
        status,
      },
      include: { role: true },
    });

    await logAuditAction({
      userId: currentUser.userId,
      action: 'USER_CREATE',
      entityType: 'user',
      entityId: user.id,
      newValue: { email: user.email, role: user.role.name },
    });

    const { passwordHash: _, ...sanitizedUser } = user;
    return NextResponse.json({ message: 'User created successfully', user: sanitizedUser }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'User with this email already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 });
  }
}
