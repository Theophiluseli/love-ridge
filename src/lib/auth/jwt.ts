import jwt from 'jsonwebtoken';

const IS_DEV = process.env.NODE_ENV === 'development';

// Only for local development. Production must set JWT_SECRET (Vercel → Settings → Environment Variables).
const DEV_FALLBACK_SECRET = 'loveridge-local-development-only-secret';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (IS_DEV) return DEV_FALLBACK_SECRET;
  // Fail closed: never sign or accept admin tokens with a guessable secret.
  throw new Error('JWT_SECRET is missing or too short. Set it in the hosting environment.');
}

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '8h', algorithm: 'HS256' });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  // Local-only convenience session created by the admin layout on localhost. Never honoured
  // in production builds (NODE_ENV is "production" on Vercel and with `next start`).
  if (IS_DEV && token && token.startsWith('dev-token-')) {
    return {
      userId: 'admin-fallback-id',
      email: 'admin@loveridge.com',
      name: 'Desmond Senanu',
      roleId: 'super-admin-role',
      roleName: 'Super Admin',
      permissions: ['*'],
    };
  }
  try {
    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] }) as TokenPayload;
    // Tokens minted by the old password-less fallback login are no longer accepted.
    if (!IS_DEV && decoded?.userId === 'admin-fallback-id') return null;
    return decoded;
  } catch (err) {
    return null;
  }
}
