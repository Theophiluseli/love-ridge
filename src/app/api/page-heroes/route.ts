import { NextRequest, NextResponse } from 'next/server';
import { getSystemSetting, setSystemSetting } from '@/lib/system-settings';
import { broadcastCatalogUpdate } from '@/lib/realtime-broadcast';
import { PageHeroConfigs, DEFAULT_PAGE_HEROES } from '@/lib/page-heroes-constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, isDefault } = await getSystemSetting<PageHeroConfigs>('page_hero_configs', DEFAULT_PAGE_HEROES);
    const merged: PageHeroConfigs = {
      ...DEFAULT_PAGE_HEROES,
      ...(data || {}),
    };

    return NextResponse.json(
      { heroes: merged, isDefault },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err) {
    return NextResponse.json({ heroes: DEFAULT_PAGE_HEROES, isDefault: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body.heroes !== 'object') {
      return NextResponse.json({ error: 'Invalid payload. Expecting heroes object.' }, { status: 400 });
    }

    const current = (await getSystemSetting<PageHeroConfigs>('page_hero_configs', DEFAULT_PAGE_HEROES)).data;
    const updated: PageHeroConfigs = {
      ...current,
      ...body.heroes,
    };

    await setSystemSetting('page_hero_configs', updated);

    // Broadcast update across all open tabs & devices
    await broadcastCatalogUpdate('hero', 'UPDATE');

    return NextResponse.json(
      {
        message: 'Page hero configurations saved successfully!',
        heroes: updated,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save page heroes' }, { status: 500 });
  }
}
