import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 43200; // 12 hours

export interface CurrencyRatesResponse {
  success: boolean;
  isLive: boolean;
  rates: {
    GHS: number;
    USD: number;
    EUR: number;
    GBP: number;
  };
  lastUpdated?: string;
  fetchedAt: string;
}

const FALLBACK_RATES = {
  GHS: 1.0,
  USD: 15.5,
  EUR: 16.8,
  GBP: 19.8,
};

// In-memory server cache to eliminate round-trips and 429 rate limiting
let cachedCurrencyData: {
  rates: { GHS: number; USD: number; EUR: number; GBP: number };
  lastUpdated: string;
  timestamp: number;
} | null = null;

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function GET() {
  const now = new Date().toISOString();
  const nowMs = Date.now();

  // 1. Return immediately from in-memory cache if fresh (< 6 hours)
  if (cachedCurrencyData && nowMs - cachedCurrencyData.timestamp < CACHE_TTL_MS) {
    return NextResponse.json<CurrencyRatesResponse>(
      {
        success: true,
        isLive: true,
        rates: cachedCurrencyData.rates,
        lastUpdated: cachedCurrencyData.lastUpdated,
        fetchedAt: now,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400',
        },
      }
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 21600 },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const ghsRate = data?.rates?.GHS;

    if (!ghsRate || typeof ghsRate !== 'number') {
      throw new Error('GHS rate missing or invalid');
    }

    const eurRate = data?.rates?.EUR || 1;
    const gbpRate = data?.rates?.GBP || 1;

    // Rates expressed as: 1 Unit of Foreign Currency = X Ghanaian Cedis (GHS)
    const rates = {
      GHS: 1.0,
      USD: Number(ghsRate.toFixed(4)),
      EUR: Number((ghsRate / eurRate).toFixed(4)),
      GBP: Number((ghsRate / gbpRate).toFixed(4)),
    };

    cachedCurrencyData = {
      rates,
      lastUpdated: data.time_last_update_utc || now,
      timestamp: nowMs,
    };

    return NextResponse.json<CurrencyRatesResponse>(
      {
        success: true,
        isLive: true,
        rates,
        lastUpdated: cachedCurrencyData.lastUpdated,
        fetchedAt: now,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.warn('[Currency API] Using fallback/cached exchange rates due to error:', error);

    // If we have previous cache data (even if slightly stale), use that instead of hardcoded
    const fallbackRates = cachedCurrencyData?.rates || FALLBACK_RATES;

    return NextResponse.json<CurrencyRatesResponse>(
      {
        success: Boolean(cachedCurrencyData),
        isLive: Boolean(cachedCurrencyData),
        rates: fallbackRates,
        lastUpdated: cachedCurrencyData?.lastUpdated || now,
        fetchedAt: now,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  }
}
