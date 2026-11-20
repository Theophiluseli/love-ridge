import type { NextRequest } from 'next/server';

/**
 * Simple fixed-window rate limiter kept in server memory.
 * On Vercel each serverless instance has its own memory, so this is a first line of defence
 * against bursts and scripted abuse, not a global guarantee. For stronger protection enable
 * Vercel Firewall rate-limiting rules on /api/auth/login and /api/leads.
 */

declare global {
  var __rateLimitBuckets: Map<string, { count: number; resetAt: number }> | undefined;
}

const buckets = (globalThis.__rateLimitBuckets ||= new Map());

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || (req as any).ip || 'unknown';
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/** Count one hit against `key`; returns whether it is still within `limit` per `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  if (buckets.size > 10000) {
    buckets.forEach((v, k) => {
      if (v.resetAt <= now) buckets.delete(k);
    });
  }
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }
  current.count += 1;
  const allowed = current.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - current.count),
    retryAfterSeconds: allowed ? 0 : Math.ceil((current.resetAt - now) / 1000),
  };
}

/** Peek without counting a hit. */
export function isRateLimited(key: string, limit: number): boolean {
  const current = buckets.get(key);
  return Boolean(current && current.resetAt > Date.now() && current.count >= limit);
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}
