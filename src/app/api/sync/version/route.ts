import { NextResponse } from 'next/server';
import { getCatalogRevision } from '@/lib/realtime-broadcast';

export const dynamic = 'force-dynamic';

export async function GET() {
  const revision = getCatalogRevision();
  return NextResponse.json(
    {
      ...revision,
      serverTime: Date.now(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}
