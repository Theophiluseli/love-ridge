import { createClient } from '@supabase/supabase-js';

export type CatalogType = 'properties' | 'products' | 'categories';
export type EventType = 'INSERT' | 'UPDATE' | 'DELETE';

// Global revision registry shared across server modules
declare global {
  var __catalogRevision: {
    version: number;
    properties: number;
    products: number;
    categories: number;
  } | undefined;
}

if (!globalThis.__catalogRevision) {
  globalThis.__catalogRevision = {
    version: Date.now(),
    properties: Date.now(),
    products: Date.now(),
    categories: Date.now(),
  };
}

export function getCatalogRevision() {
  if (!globalThis.__catalogRevision) {
    globalThis.__catalogRevision = {
      version: Date.now(),
      properties: Date.now(),
      products: Date.now(),
      categories: Date.now(),
    };
  }
  return globalThis.__catalogRevision;
}

/**
 * Broadcasts a catalog mutation event over Supabase Realtime and advances the server revision.
 * All subscribed browser clients receive this and re-fetch fresh data.
 */
export async function broadcastCatalogUpdate(
  catalog: CatalogType,
  event: EventType,
  payload?: Record<string, any>
) {
  const now = Date.now();
  if (!globalThis.__catalogRevision) {
    globalThis.__catalogRevision = { version: now, properties: now, products: now, categories: now };
  }
  globalThis.__catalogRevision[catalog] = now;
  globalThis.__catalogRevision.version = now;

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
