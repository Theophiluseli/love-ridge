import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signAccessToken } from '@/lib/auth/jwt';
import { getUserPermissions } from '@/lib/auth/rbac';
import { logAuditAction } from '@/lib/auth/audit';
import { getClientIp, isRateLimited, rateLimit, resetRateLimit } from '@/lib/rate-limit';
import { isTwoFactorActive, verifyTotp } from '@/lib/auth/totp';

export const dynamic = 'force-dynamic';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS_PER_ACCOUNT = 8;
const MAX_ATTEMPTS_PER_IP = 30;
// Pre-computed hash used to keep response timing similar when the account does not exist.
const DUMMY_HASH = '$2a$10$.HhkolkmOyoVxpDXUi1e0.o3lyZ4Yjv5gplrRSTj9F2wbe0BzYrFq';

function tooMany(retryAfter: number) {
  return NextResponse.json(
    { error: 'Too many sign-in attempts. Please wait 15 minutes and try again.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter || 900) } }
  );
}

/**
 * Admin sign-in. Only real, ACTIVE database accounts with a matching bcrypt password can sign in.
 * (The previous version created or impersonated a Super Admin for any "@loveridge.com" email
 * without checking the password; that has been removed.)
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const ipLimit = rateLimit(`login-ip:${ip}`, MAX_ATTEMPTS_PER_IP, WINDOW_MS);
  if (!ipLimit.allowed) return tooMany(ipLimit.retryAfterSeconds);

  let email = '';
  let password = '';
  let body2fa: { code?: unknown } = {};
  try {
    const body = await req.json().catch(() => ({}));
    email = String(body.email || '').trim().toLowerCase().slice(0, 254);
    password = String(body.password || '').slice(0, 200);
    body2fa = { code: body.code };
  } catch {
    /* handled below */
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const accountKey = `login-fail:${email}`;
  if (isRateLimited(accountKey, MAX_FAILS_PER_ACCOUNT)) return tooMany(900);

  try {
    const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
    const passwordOk = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH).catch(() => false);

    if (!user || !passwordOk || user.status !== 'ACTIVE') {
      rateLimit(accountKey, MAX_FAILS_PER_ACCOUNT, WINDOW_MS);
      logAuditAction({
        userId: user?.id,
        action: 'USER_LOGIN_FAILED',
        entityType: 'user',
        entityId: user?.id || email,
        newValue: { ip },
      }).catch(() => null);
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // 2-step login: a correct password alone is not enough once an authenticator is set up.
    if (isTwoFactorActive(user)) {
      const code = String(body2fa.code || '').trim();
      if (!code) {
        return NextResponse.json(
          { twoFactorRequired: true, message: 'Enter the 6-digit code from your authenticator app.' },
          { status: 200 }
        );
      }
      if (!verifyTotp(user.twoFactorSecret, code)) {
        rateLimit(accountKey, MAX_FAILS_PER_ACCOUNT, WINDOW_MS);
        logAuditAction({
          userId: user.id,
          action: 'USER_LOGIN_2FA_FAILED',
          entityType: 'user',
          entityId: user.id,
          newValue: { ip },
        }).catch(() => null);
        return NextResponse.json(
          { twoFactorRequired: true, error: 'That authentication code is not right. Try the newest code.' },
          { status: 401 }
        );
      }
    }

    resetRateLimit(accountKey);

    const permissions = await getUserPermissions(user.roleId).catch(() => [] as string[]);
    const token = signAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name || 'Loveridge Admin',
      roleId: user.roleId,
      roleName: user.role?.name || 'Staff',
      permissions,
    });

    prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => null);
    logAuditAction({ userId: user.id, action: 'USER_LOGIN', entityType: 'user', entityId: user.id, newValue: { ip } }).catch(() => null);

    const response = NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role?.name || 'Staff',
        permissions,
        twoFactorEnabled: user.twoFactorEnabled || false,
      },
    });

    response.cookies.set({
      name: 'loveridge_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Login route error:', error);
    return NextResponse.json(
      { error: 'Sign-in is temporarily unavailable. Please try again in a minute.' },
      { status: 503 }
    );
  }
}
