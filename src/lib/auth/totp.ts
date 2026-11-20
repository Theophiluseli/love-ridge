import crypto from 'crypto';

/**
 * Time-based one-time passwords (RFC 6238) for admin 2-step login.
 * Compatible with Google Authenticator, Microsoft Authenticator, Authy, 1Password, etc.
 * (SHA-1, 6 digits, 30-second steps — the defaults every authenticator app expects.)
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const STEP_SECONDS = 30;
const DIGITS = 6;

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const ch of clean) {
    value = (value << 5) | ALPHABET.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** New random 160-bit secret, base32 encoded. */
export function generateTotpSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

function hotp(secret: Buffer, counter: number): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac('sha1', secret).update(msg).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    (((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3]) %
    10 ** DIGITS;
  return code.toString().padStart(DIGITS, '0');
}

export function totpAt(secretBase32: string, timeMs = Date.now()): string {
  return hotp(base32Decode(secretBase32), Math.floor(timeMs / 1000 / STEP_SECONDS));
}

/**
 * Check a 6-digit code. Accepts the previous, current and next 30-second window to allow for
 * phone clock drift. Constant-time comparison.
 */
export function verifyTotp(secretBase32: string | null | undefined, code: unknown, timeMs = Date.now()): boolean {
  if (!secretBase32) return false;
  const clean = String(code ?? '').replace(/\s+/g, '');
  if (!/^\d{6}$/.test(clean)) return false;
  const key = base32Decode(secretBase32);
  if (key.length < 10) return false;
  const counter = Math.floor(timeMs / 1000 / STEP_SECONDS);
  let ok = false;
  for (const delta of [-1, 0, 1]) {
    const expected = Buffer.from(hotp(key, counter + delta));
    if (crypto.timingSafeEqual(expected, Buffer.from(clean))) ok = true;
  }
  return ok;
}

/** otpauth:// link that authenticator apps understand (tapping it on a phone adds the account). */
export function otpauthUrl(secretBase32: string, accountEmail: string, issuer = 'Loveridge Admin'): string {
  const label = encodeURIComponent(`${issuer}:${accountEmail}`);
  return `otpauth://totp/${label}?secret=${secretBase32}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${STEP_SECONDS}`;
}

/** 2-step login is only in force when the flag is on AND a confirmed secret exists. */
export function isTwoFactorActive(user: { twoFactorEnabled?: boolean | null; twoFactorSecret?: string | null } | null | undefined): boolean {
  return Boolean(user?.twoFactorEnabled && user?.twoFactorSecret);
}
