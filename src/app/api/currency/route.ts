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

export async function GET() {
  const now = new Date().toISOString();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 43200 },
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

    return NextResponse.json<CurrencyRatesResponse>(
      {
        success: true,
        isLive: true,
        rates,
        lastUpdated: data.time_last_update_utc || now,
        fetchedAt: now,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.warn('[Currency API] Using fallback exchange rates due to error:', error);

    return NextResponse.json<CurrencyRatesResponse>({
      success: false,
      isLive: false,
      rates: FALLBACK_RATES,
      fetchedAt: now,
    });
  }
}
