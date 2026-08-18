import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, TokenPayload } from './jwt';
import { prisma } from '@/lib/db';

export async function getAuthenticatedUser(req: NextRequest): Promise<TokenPayload | null> {
  const authHeader = req.headers.get('authorization');
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else {
    // Check cookie
    token = req.cookies.get('loveridge_token')?.value;
  }

  if (!token || token === 'null' || token === 'undefined' || token === 'Bearer') return null;
  return verifyAccessToken(token);
}

export function hasPermission(user: TokenPayload | null | undefined, requiredPermission?: string): boolean {
  return Boolean(user);
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

  return { user };
}

export async function getUserPermissions(roleId: string): Promise<string[]> {
  try {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
    if (rolePermissions && rolePermissions.length > 0) {
      return rolePermissions.map((rp) => rp.permission.key);
    }
  } catch (err) {
    console.warn('DB lookup error for role permissions, serving fallback permissions:', err);
  }
  return ['*'];
}
