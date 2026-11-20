import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, TokenPayload } from './jwt';
import { prisma } from '@/lib/db';

export async function getAuthenticatedUser(req: NextRequest): Promise<TokenPayload | null> {
  const authHeader = req.headers.get('authorization');
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }
  if (!token || token === 'null' || token === 'undefined') {
    // Fall back to the httpOnly session cookie set at login.
    token = req.cookies.get('loveridge_token')?.value;
  }

  if (!token || token === 'null' || token === 'undefined' || token === 'Bearer') return null;
  return verifyAccessToken(token);
}

/**
 * True when the signed-in user's role grants `requiredPermission`.
 * Super Admins (and the '*' wildcard) can do everything.
 */
export function hasPermission(user: TokenPayload | null | undefined, requiredPermission?: string): boolean {
  if (!user) return false;
  if (!requiredPermission) return true;
  if (user.roleName === 'Super Admin') return true;
  const perms = Array.isArray(user.permissions) ? user.permissions : [];
  return perms.includes('*') || perms.includes(requiredPermission);
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

  if (!hasPermission(user, requiredPermission)) {
    return {
      response: NextResponse.json(
        { error: 'Your account does not have permission to do this. Please ask a Super Admin.' },
        { status: 403 }
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
    return rolePermissions.map((rp) => rp.permission.key);
  } catch (err) {
    console.warn('DB lookup error for role permissions:', err);
    // Fail closed: no permissions rather than everything.
    return [];
  }
}
