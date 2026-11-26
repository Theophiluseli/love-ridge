import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { getSystemSetting, setSystemSetting, sameJsonValue } from '@/lib/system-settings';
import { broadcastCatalogUpdate } from '@/lib/realtime-broadcast';
import { moveInlineImageToStorage } from '@/lib/inline-image-storage';

export const dynamic = 'force-dynamic';
// The first save after this change moves embedded slide images into storage; allow time for it.
export const maxDuration = 60;

export interface HeroSlide {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  active: boolean;
  order: number;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  { id: 'slide-1', imageUrl: '/hero_carousel_1.jpg', title: 'Luxury Villa Showcase', active: true, order: 1 },
  { id: 'slide-2', imageUrl: '/hero_carousel_2.jpg', title: 'Modern Estate Residence', active: true, order: 2 },
  { id: 'slide-3', imageUrl: '/hero_carousel_3.jpg', title: 'Commercial Suite & Lands', active: true, order: 3 },
  { id: 'slide-4', imageUrl: '/hero_carousel_4.jpg', title: 'Executive Living Spaces', active: true, order: 4 },
];

export async function GET() {
  try {
    const { data: slides, isDefault } = await getSystemSetting<HeroSlide[]>('hero_slides', DEFAULT_SLIDES, { fresh: true });
    return NextResponse.json(
      { slides, isDefault },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err) {
    return NextResponse.json({ slides: DEFAULT_SLIDES, isDefault: true });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'content.manage');
  if ('response' in auth) return auth.response;

  try {
    const body = await req.json();
    if (!body || !Array.isArray(body.slides)) {
      return NextResponse.json({ error: 'Invalid payload. Expecting slides array.' }, { status: 400 });
    }

    // Slides used to be saved with the whole image embedded as text (several MB that every visitor
    // downloaded). Move any embedded image into file storage and keep only its URL.
    const inputSlides: HeroSlide[] = await Promise.all(
      (body.slides as HeroSlide[]).map(async (slide) => ({
        ...slide,
        imageUrl: await moveInlineImageToStorage(slide.imageUrl, 'hero'),
      }))
    );

    const written = await setSystemSetting('hero_slides', inputSlides, { strict: true });
    const stored = (await getSystemSetting<HeroSlide[]>('hero_slides', DEFAULT_SLIDES, { fresh: true })).data;
    if (!written || !sameJsonValue(stored, inputSlides)) {
      return NextResponse.json(
        { error: 'The database did not accept the change, so the slides were not saved. Please try again in a moment.' },
        { status: 503 }
      );
    }

    // Broadcast change to all devices & clients via Supabase Realtime WebSocket
    await broadcastCatalogUpdate('hero', 'UPDATE', { count: inputSlides.length });

    return NextResponse.json(
      {
        message: 'Hero slides updated and saved permanently to database!',
        slides: inputSlides,
        isDefault: false,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save hero slides' }, { status: 500 });
  }
}
