import { supabaseAdmin } from './supabase-admin';

declare global {
  var __systemSettingsCache: Map<string, { value: any; timestamp: number }> | undefined;
}

if (!globalThis.__systemSettingsCache) {
  globalThis.__systemSettingsCache = new Map();
}
const settingsCache = globalThis.__systemSettingsCache;
const CACHE_TTL = 60000; // 60s cache

export async function getSystemSetting<T>(key: string, defaultValue: T): Promise<{ data: T; isDefault: boolean }> {
  const cached = settingsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { data: cached.value as T, isDefault: false };
  }

  try {
    const queryPromise = supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    // 1500ms timeout race to ensure page loads NEVER hang
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
    const result: any = await Promise.race([queryPromise, timeoutPromise]);

    if (result && result.data && result.data.value) {
      try {
        const parsed = JSON.parse(result.data.value);
        settingsCache.set(key, { value: parsed, timestamp: Date.now() });
        return { data: parsed as T, isDefault: false };
      } catch (parseErr) {
        settingsCache.set(key, { value: result.data.value, timestamp: Date.now() });
        return { data: result.data.value as T, isDefault: false };
      }
    }
  } catch (err) {
    console.warn(`Failed to read system setting "${key}" from Supabase:`, err);
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
    const { error } = await supabaseAdmin.from('system_settings').upsert({
      key,
      value: jsonStr,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`Error saving setting "${key}":`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Failed to write system setting "${key}":`, err);
    return false;
  }
}
