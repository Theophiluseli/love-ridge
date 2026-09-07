'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

type CatalogType = 'properties' | 'products' | 'categories';

interface RevisionData {
  version: number;
  properties: number;
  products: number;
  categories: number;
}

/**
 * Resilient multi-channel real-time sync hook.
 *
 * Guarantees that all devices (mobile phones, tablets, desktops, PWAs, background tabs)
 * stay synchronized whenever a property, product, or category is added or updated.
 *
 * Architecture:
 * 1. Supabase Realtime WebSocket broadcast.
 * 2. Same-device BroadcastChannel for instant cross-tab sync.
 * 3. Mobile sleep/wake & visibility change check against /api/sync/version.
 * 4. Lightweight 15s background heartbeat check.
 */
export function useRealtimeSync(onUpdate: (type: CatalogType) => void) {
  const callbackRef = useRef(onUpdate);
  const lastSeenRef = useRef<RevisionData>({
    version: 0,
    properties: 0,
    products: 0,
    categories: 0,
  });

  useEffect(() => {
    callbackRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Helper: fetch version endpoint and trigger updates for any advanced counters
    const checkServerRevision = async () => {
      try {
        const res = await fetch('/api/sync/version', { cache: 'no-store' });
        if (!res.ok) return;
        const data: RevisionData = await res.json();

        // If this is the initial fetch, record baseline without triggering false refetch
        if (lastSeenRef.current.version === 0) {
          lastSeenRef.current = { ...data };
          return;
        }

        if (data.properties > lastSeenRef.current.properties) {
          lastSeenRef.current.properties = data.properties;
          callbackRef.current('properties');
        }
        if (data.products > lastSeenRef.current.products) {
          lastSeenRef.current.products = data.products;
          callbackRef.current('products');
        }
        if (data.categories > lastSeenRef.current.categories) {
          lastSeenRef.current.categories = data.categories;
          callbackRef.current('categories');
        }
        lastSeenRef.current.version = data.version;
      } catch {
        // network blip
      }
    };

    // Initialize baseline revision
    checkServerRevision();

    // 1. Supabase Realtime Broadcast Subscription
    const channel = supabase
      .channel('loveridge:catalog')
      .on('broadcast', { event: 'catalog_update' }, (payload) => {
        const catalog = payload?.payload?.catalog as CatalogType | undefined;
        const timestamp = payload?.payload?.timestamp as number | undefined;
        if (catalog) {
          if (timestamp && timestamp > (lastSeenRef.current[catalog] || 0)) {
            lastSeenRef.current[catalog] = timestamp;
            lastSeenRef.current.version = timestamp;
          }
          callbackRef.current(catalog);

          // Relay across tabs on same device via BroadcastChannel
          try {
            bc?.postMessage({ catalog, timestamp });
          } catch {}
        }
      })
      .subscribe();

    // 2. Same-Device BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('loveridge_catalog_sync');
        bc.onmessage = (event) => {
          const catalog = event.data?.catalog as CatalogType | undefined;
          if (catalog) {
            callbackRef.current(catalog);
          }
        };
      }
    } catch {}

    // 3. Visibility Change & Window Focus (Crucial for mobile phones waking up)
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        checkServerRevision();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    // 4. Lightweight 15s Heartbeat Polling (Only runs when document is active)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkServerRevision();
      }
    }, 15000);

    return () => {
      supabase.removeChannel(channel);
      if (bc) {
        try {
          bc.close();
        } catch {}
      }
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      clearInterval(interval);
    };
  }, []);
}
