import { prisma } from './db';

// In-memory cache for blazing fast reads (<2ms)
const settingsCache = new Map<string, { value: any; timestamp: number }>();
const CACHE_TTL = 60000; // 60s cache

let tableInitialized = false;

async function ensureSettingsTable() {
  if (tableInitialized) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    tableInitialized = true;
  } catch (err) {
    // Ignore error if table exists or during transient network blips
  }
}

export async function getSystemSetting<T>(key: string, defaultValue: T): Promise<{ data: T; isDefault: boolean }> {
  const cached = settingsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { data: cached.value as T, isDefault: false };
  }

  try {
    await ensureSettingsTable();

    const queryPromise = prisma.$queryRawUnsafe<{ key: string; value: string }[]>(
      'SELECT key, value FROM system_settings WHERE key = $1 LIMIT 1;',
      key
    );

    // 1500ms timeout race to prevent slow cold starts
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
    const result = await Promise.race([queryPromise, timeoutPromise]);

    if (result && Array.isArray(result) && result.length > 0) {
      const parsed = JSON.parse(result[0].value);
      settingsCache.set(key, { value: parsed, timestamp: Date.now() });
      return { data: parsed as T, isDefault: false };
    }
  } catch (err) {
    console.warn(`Failed to read system setting "${key}" from database:`, err);
  }

  return { data: defaultValue, isDefault: true };
}

export async function setSystemSetting<T>(key: string, value: T): Promise<boolean> {
  const jsonStr = JSON.stringify(value);
  settingsCache.set(key, { value, timestamp: Date.now() });

  try {
    await ensureSettingsTable();

    await prisma.$executeRawUnsafe(
      `INSERT INTO system_settings (key, value, updated_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (key) 
       DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();`,
      key,
      jsonStr
    );

    return true;
  } catch (err) {
    console.error(`Failed to write system setting "${key}" to database:`, err);
    return false;
  }
}
