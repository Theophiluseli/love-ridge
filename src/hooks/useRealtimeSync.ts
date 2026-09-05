'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

type CatalogType = 'properties' | 'products';

/**
 * Subscribes to the Supabase Realtime broadcast channel `loveridge:catalog`.
 * Calls `onUpdate` whenever a catalog mutation event is received.
 *
 * @param onUpdate - Callback invoked with the catalog type that changed.
 *
 * Usage:
 *   useRealtimeSync((type) => {
 *     if (type === 'properties') fetchProperties();
 *     if (type === 'products') fetchProducts();
 *   });
 */
export function useRealtimeSync(onUpdate: (type: CatalogType) => void) {
  // Keep a stable ref to the callback so the subscription never needs to re-register
  const callbackRef = useRef(onUpdate);
  useEffect(() => {
    callbackRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const channel = supabase
      .channel('loveridge:catalog')
      .on('broadcast', { event: 'catalog_update' }, (payload) => {
        const catalog = payload?.payload?.catalog as CatalogType | undefined;
        if (catalog) {
          callbackRef.current(catalog);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // empty — only run once on mount
}
