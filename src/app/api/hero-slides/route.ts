import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

const DATA_FILE = path.join(process.cwd(), 'scratch', 'hero-slides.json');

function ensureDataFile() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_SLIDES, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error maintaining hero-slides.json file:', err);
  }
}

function readSlidesFromFile(): HeroSlide[] {
  ensureDataFile();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed reading hero slides from file:', err);
  }
  return DEFAULT_SLIDES;
}

function writeSlidesToFile(slides: HeroSlide[]) {
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(slides, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing hero slides to file:', err);
  }
}

export async function GET() {
  try {
    const slides = readSlidesFromFile();
    return NextResponse.json({ slides });
  } catch (err) {
    return NextResponse.json({ slides: DEFAULT_SLIDES });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !Array.isArray(body.slides)) {
      return NextResponse.json({ error: 'Invalid payload. Expecting slides array.' }, { status: 400 });
    }

    const slides: HeroSlide[] = body.slides;
    writeSlidesToFile(slides);

    return NextResponse.json({
      message: 'Hero slides updated successfully!',
      slides,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save hero slides' }, { status: 500 });
  }
}
