import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { logAuditAction } from '@/lib/auth/audit';

export async function GET(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'roles.manage');
  if ('response' in auth) return auth.response;

  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    });

    const allPermissions = await prisma.permission.findMany();

    return NextResponse.json({ roles, allPermissions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch roles.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'roles.manage');
  if ('response' in auth) return auth.response;
  const user = auth.user;

  try {
    const body = await req.json();
    const { name, description, permissionKeys } = body;

    if (!name) {
      return NextResponse.json({ error: 'Role name is required.' }, { status: 400 });
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        isSystemRole: false,
      },
    });

    if (Array.isArray(permissionKeys) && permissionKeys.length > 0) {
      const perms = await prisma.permission.findMany({
        where: { key: { in: permissionKeys } },
      });

      for (const p of perms) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: p.id,
          },
        });
      }
    }

    await logAuditAction({
      userId: user.userId,
      action: 'ROLE_CREATE',
      entityType: 'role',
      entityId: role.id,
      newValue: { name, permissionKeys },
    });

    return NextResponse.json({ message: 'Role created successfully', role }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Role name already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create role.' }, { status: 500 });
  }
}
