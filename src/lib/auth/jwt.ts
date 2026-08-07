import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'loveridge_super_secret_jwt_key_2026_ghana_real_estate';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}
