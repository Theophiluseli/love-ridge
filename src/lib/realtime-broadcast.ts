import { createClient } from '@supabase/supabase-js';
import { getSystemSetting, setSystemSetting } from './system-settings';
import { invalidatePropertiesCache } from './properties-store';
import { invalidateProductsCache } from './products-store';

export type CatalogType = 'properties' | 'products' | 'categories';
export type EventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface CatalogRevision {
  version: number;
  properties: number;
  products: number;
  categories: number;
}

// Global revision registry shared across current server instance
declare global {
  var __catalogRevision: CatalogRevision | undefined;
}

const DEFAULT_REVISION: CatalogRevision = {
  version: 1,
  properties: 1,
  products: 1,
  categories: 1,
};

if (!globalThis.__catalogRevision) {
  globalThis.__catalogRevision = { ...DEFAULT_REVISION };
}

export async function getLatestCatalogRevision(): Promise<CatalogRevision> {
  try {
    const { data } = await getSystemSetting<CatalogRevision>('catalog_revision', DEFAULT_REVISION);
    if (data && typeof data.version === 'number') {
      globalThis.__catalogRevision = { ...data };
      return { ...data };
    }
  } catch (e) {
    // Fallback to local memory registry
  }

  return { ...getCatalogRevision() };
}

export function getCatalogRevision(): CatalogRevision {
  if (!globalThis.__catalogRevision) {
    globalThis.__catalogRevision = { ...DEFAULT_REVISION };
  }
  return { ...globalThis.__catalogRevision };
}

/**
 * Broadcasts a catalog mutation event over Supabase Realtime and advances the persistent server revision.
 * All subscribed browser clients receive this and re-fetch fresh data.
 */
export async function broadcastCatalogUpdate(
  catalog: CatalogType,
  event: EventType,
  payload?: Record<string, any>
) {
  const now = Date.now();

  // 1. Immediately invalidate in-memory server caches so next read gets fresh data
  if (catalog === 'properties') {
    invalidatePropertiesCache();
  } else if (catalog === 'products') {
    invalidateProductsCache();
  } else if (catalog === 'categories') {
    invalidateProductsCache();
  }

  // 2. Advance local memory revision
  if (!globalThis.__catalogRevision) {
    globalThis.__catalogRevision = { version: now, properties: now, products: now, categories: now };
  }
  globalThis.__catalogRevision[catalog] = now;
  globalThis.__catalogRevision.version = now;

  // 3. Persist revision to PostgreSQL system_settings so all serverless workers see it
  try {
    const existing = await getLatestCatalogRevision();
    const updatedRevision: CatalogRevision = {
      ...existing,
      [catalog]: now,
      version: now,
    };
    globalThis.__catalogRevision = updatedRevision;
    await setSystemSetting('catalog_revision', updatedRevision);
  } catch (e) {
    // Ignore setting error
  }

  // 4. Broadcast via Supabase Realtime WebSocket to all active browser clients
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) return; // skip if env vars missing

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 20 } },
    });

    const channel = supabase.channel('loveridge:catalog');

    await new Promise<void>((resolve) => {
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'catalog_update',
            payload: { catalog, event, timestamp: now, version: now, ...payload },
          });
          // Small delay to allow message to flush before unsubscribing
          setTimeout(() => {
            supabase.removeChannel(channel);
            resolve();
          }, 300);
        }
      });

      // Timeout safety — never block the API response
      setTimeout(() => resolve(), 2000);
    });
  } catch (_) {
    // Real-time broadcast is best-effort; data is already securely saved
  }
}
