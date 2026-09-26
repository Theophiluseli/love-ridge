import { prisma } from './db';

declare global {
  var __systemSettingsCache: Map<string, { value: any; timestamp: number }> | undefined;
}

if (!globalThis.__systemSettingsCache) {
  globalThis.__systemSettingsCache = new Map();
}
const settingsCache = globalThis.__systemSettingsCache;
const CACHE_TTL = 60000; // 60s in-memory cache

export async function getSystemSetting<T>(key: string, defaultValue: T): Promise<{ data: T; isDefault: boolean }> {
  const cached = settingsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
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

export async function setSystemSetting<T>(key: string, value: T): Promise<boolean> {
  const jsonStr = typeof value === 'string' ? value : JSON.stringify(value);
  settingsCache.set(key, { value, timestamp: Date.now() });

  try {
    // Upsert directly into PostgreSQL system_settings table via Prisma
    await prisma.$executeRaw`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES (${key}, ${jsonStr}, NOW())
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
    `;
    return true;
  } catch (err) {
    console.error(`Failed to write system setting "${key}" via Prisma:`, err);
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
