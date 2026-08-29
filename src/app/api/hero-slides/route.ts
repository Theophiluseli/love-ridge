import { NextRequest, NextResponse } from 'next/server';
import { getSystemSetting, setSystemSetting } from '@/lib/system-settings';

export const dynamic = 'force-dynamic';

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
    const { data: slides, isDefault } = await getSystemSetting<HeroSlide[]>('hero_slides', DEFAULT_SLIDES);
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
  try {
    const body = await req.json();
    if (!body || !Array.isArray(body.slides)) {
      return NextResponse.json({ error: 'Invalid payload. Expecting slides array.' }, { status: 400 });
    }

    const inputSlides: HeroSlide[] = body.slides;
    await setSystemSetting('hero_slides', inputSlides);

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
