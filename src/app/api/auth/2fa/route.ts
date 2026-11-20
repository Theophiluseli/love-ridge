import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { logAuditAction } from '@/lib/auth/audit';
import { generateTotpSecret, isTwoFactorActive, otpauthUrl, verifyTotp } from '@/lib/auth/totp';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

async function currentUser(req: NextRequest) {
  const auth = await requireAuthPermission(req);
  if ('response' in auth) return { response: auth.response };
  const user = await prisma.user.findUnique({
    where: { id: auth.user.userId },
    select: { id: true, email: true, passwordHash: true, twoFactorEnabled: true, twoFactorSecret: true },
  });
  if (!user) {
    return { response: NextResponse.json({ error: 'Account not found. Please sign in again.' }, { status: 404 }) };
  }
  return { user };
}

/** Is 2-step login on for the signed-in account? */
export async function GET(req: NextRequest) {
  const r = await currentUser(req);
  if ('response' in r) return r.response;
  return NextResponse.json({ enabled: isTwoFactorActive(r.user) }, { headers: NO_STORE });
}

/**
 * body.action:
 *   "setup"   -> creates a new secret (not active yet) and returns the key + otpauth link
 *   "enable"  -> { code } confirms the authenticator app works and turns 2-step login on
 *   "disable" -> { code, password } turns it off
 */
export async function POST(req: NextRequest) {
  const r = await currentUser(req);
  if ('response' in r) return r.response;
  const { user } = r;

  const limit = rateLimit(`2fa:${user.id}:${getClientIp(req)}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many attempts. Please wait 15 minutes.' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || '');
  const active = isTwoFactorActive(user);

  if (action === 'setup') {
    if (active) {
      return NextResponse.json({ error: '2-step login is already on. Turn it off first to move it to a new phone.' }, { status: 400 });
    }
    const secret = generateTotpSecret();
    await prisma.user.update({ where: { id: user.id }, data: { twoFactorSecret: secret, twoFactorEnabled: false } });
    return NextResponse.json(
      { secret: secret.replace(/(.{4})/g, '$1 ').trim(), otpauthUrl: otpauthUrl(secret, user.email) },
      { headers: NO_STORE }
    );
  }

  if (action === 'enable') {
    if (active) return NextResponse.json({ enabled: true });
    if (!user.twoFactorSecret) {
      return NextResponse.json({ error: 'Start the setup first.' }, { status: 400 });
    }
    if (!verifyTotp(user.twoFactorSecret, body.code)) {
      return NextResponse.json({ error: 'That code is not right. Check the time on your phone and try the newest code.' }, { status: 400 });
    }
    await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });
    logAuditAction({ userId: user.id, action: 'USER_2FA_ENABLED', entityType: 'user', entityId: user.id }).catch(() => null);
    return NextResponse.json({ enabled: true });
  }

  if (action === 'disable') {
    if (!active) {
      await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
      return NextResponse.json({ enabled: false });
    }
    const passwordOk = await bcrypt.compare(String(body.password || ''), user.passwordHash).catch(() => false);
    if (!passwordOk || !verifyTotp(user.twoFactorSecret, body.code)) {
      return NextResponse.json({ error: 'Password or authentication code is incorrect.' }, { status: 400 });
    }
    await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
    logAuditAction({ userId: user.id, action: 'USER_2FA_DISABLED', entityType: 'user', entityId: user.id }).catch(() => null);
    return NextResponse.json({ enabled: false });
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}
