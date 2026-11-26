import { prisma } from './db';

declare global {
  var __systemSettingsCache: Map<string, { value: any; timestamp: number }> | undefined;
}

if (!globalThis.__systemSettingsCache) {
  globalThis.__systemSettingsCache = new Map();
}
const settingsCache = globalThis.__systemSettingsCache;
const CACHE_TTL = 60000; // 60s in-memory cache

/**
 * Reads a setting. The 60s in-memory cache is per server instance, so on Vercel (many instances)
 * a value edited through one instance can look stale on another. Pass `{ fresh: true }` for
 * settings that admins edit and visitors must see straight away (hero text, hero slides).
 */
export async function getSystemSetting<T>(
  key: string,
  defaultValue: T,
  options: { fresh?: boolean } = {}
): Promise<{ data: T; isDefault: boolean }> {
  const cached = settingsCache.get(key);
  if (!options.fresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { data: cached.value as T, isDefault: false };
  }

  try {
    // Read directly from PostgreSQL system_settings table via Prisma
    const rows = await prisma.$queryRaw<Array<{ value: string }>>`
      SELECT value FROM system_settings WHERE key = ${key} LIMIT 1
    `;

    if (rows && rows.length > 0 && rows[0].value !== undefined && rows[0].value !== null) {
      try {
        let parsed = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
        if (typeof parsed === 'string') {
          try {
            const nested = JSON.parse(parsed);
            if (nested !== null && nested !== undefined) {
              parsed = nested;
            }
          } catch (_) {}
        }
        settingsCache.set(key, { value: parsed, timestamp: Date.now() });
        return { data: parsed as T, isDefault: false };
      } catch (parseErr) {
        settingsCache.set(key, { value: rows[0].value, timestamp: Date.now() });
        return { data: rows[0].value as T, isDefault: false };
      }
    }
  } catch (err) {
    console.warn(`Failed to read system setting "${key}" via Prisma:`, err);
  }

  // If query failed or timed out, but we have a previous cached value, return it
  if (cached && cached.value !== undefined) {
    return { data: cached.value as T, isDefault: false };
  }

  return { data: defaultValue, isDefault: true };
}

/**
 * Writes a setting. By default the value is cached before the write (existing behaviour the
 * catalog stores rely on). With `{ strict: true }` the cache is only updated after the database
 * write succeeds, so a failed save is never reported back as saved.
 */
export async function setSystemSetting<T>(
  key: string,
  value: T,
  options: { strict?: boolean } = {}
): Promise<boolean> {
  const jsonStr = typeof value === 'string' ? value : JSON.stringify(value);
  if (!options.strict) settingsCache.set(key, { value, timestamp: Date.now() });

  try {
    // Upsert directly into PostgreSQL system_settings table via Prisma
    await prisma.$executeRaw`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES (${key}, ${jsonStr}, NOW())
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
    `;
    settingsCache.set(key, { value, timestamp: Date.now() });
    return true;
  } catch (err) {
    console.error(`Failed to write system setting "${key}" via Prisma:`, err);
    if (options.strict) settingsCache.delete(key);
    return false;
  }
}

export function invalidateSystemSetting(key?: string) {
  if (key) {
    settingsCache.delete(key);
  } else {
    settingsCache.clear();
  }
}

/** True when two JSON-compatible values are equal, ignoring object key order. */
export function sameJsonValue(a: unknown, b: unknown): boolean {
  const canon = (v: any): any => {
    if (Array.isArray(v)) return v.map(canon);
    if (v && typeof v === 'object') {
      return Object.keys(v)
        .filter((k) => v[k] !== undefined)
        .sort()
        .reduce((acc: any, k) => ((acc[k] = canon(v[k])), acc), {});
    }
    return v;
  };
  return JSON.stringify(canon(a)) === JSON.stringify(canon(b));
}
