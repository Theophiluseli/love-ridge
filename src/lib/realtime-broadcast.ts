import { createClient } from '@supabase/supabase-js';

type CatalogType = 'properties' | 'products';
type EventType = 'INSERT' | 'UPDATE' | 'DELETE';

/**
 * Broadcasts a catalog mutation event over Supabase Realtime.
 * All subscribed browser clients receive this and re-fetch fresh data.
 * Uses the service-role key so it works from server-side API routes.
 */
export async function broadcastCatalogUpdate(
  catalog: CatalogType,
  event: EventType,
  payload?: Record<string, any>
) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) return; // skip if env vars missing

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 10 } },
    });

    const channel = supabase.channel('loveridge:catalog');

    await new Promise<void>((resolve) => {
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'catalog_update',
            payload: { catalog, event, timestamp: Date.now(), ...payload },
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
    // Never throw — real-time is best-effort, data is already saved
  }
}
