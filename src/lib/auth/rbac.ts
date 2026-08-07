import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, TokenPayload } from './jwt';
import { prisma } from '@/lib/db';

export async function getAuthenticatedUser(req: NextRequest): Promise<TokenPayload | null> {
  const authHeader = req.headers.get('authorization');
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Check cookie
    token = req.cookies.get('loveridge_token')?.value;
  }

  if (!token) return null;
  return verifyAccessToken(token);
}

export function hasPermission(user: TokenPayload, requiredPermission: string): boolean {
  if (user.roleName === 'Super Admin') return true;
  return user.permissions.includes(requiredPermission);
}

export async function requireAuthPermission(
  req: NextRequest,
  requiredPermission?: string
): Promise<{ user: TokenPayload } | { response: NextResponse }> {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return {
      response: NextResponse.json(
        { error: 'Unauthorized. Please login to access this resource.' },
        { status: 401 }
      ),
    };
  }

  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return {
      response: NextResponse.json(
        { error: `Forbidden. Missing required permission: ${requiredPermission}` },
        { status: 403 }
      ),
    };
  }

  return { user };
}

export async function getUserPermissions(roleId: string): Promise<string[]> {
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { roleId },
    include: { permission: true },
  });
  return rolePermissions.map((rp) => rp.permission.key);
}
