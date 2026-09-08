import { NextResponse } from 'next/server';
import { getLatestCatalogRevision } from '@/lib/realtime-broadcast';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const revision = await getLatestCatalogRevision();
  return NextResponse.json(
    {
      ...revision,
      serverTime: Date.now(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}
