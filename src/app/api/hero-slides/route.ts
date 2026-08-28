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

function writeSlidesToFile(slides: HeroSlide[]): HeroSlide[] {
  ensureDataFile();
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

  const cleanSlides = slides.map((slide, idx) => {
    if (slide.imageUrl && slide.imageUrl.startsWith('data:image')) {
      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const matches = slide.imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let buffer: Buffer;
        let ext = '.jpg';

        if (matches && matches.length === 3) {
          const mime = matches[1];
          buffer = Buffer.from(matches[2], 'base64');
          if (mime.includes('png')) ext = '.png';
          else if (mime.includes('webp')) ext = '.webp';
        } else {
          const cleanBase64 = slide.imageUrl.replace(/^data:image\/\w+;base64,/, '');
          buffer = Buffer.from(cleanBase64, 'base64');
        }

        const filename = `hero-${Date.now()}-${idx}${ext}`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, buffer);

        return {
          ...slide,
          imageUrl: `/uploads/${filename}`,
        };
      } catch (err) {
        console.error('Error saving base64 image to public/uploads:', err);
      }
    }
    return slide;
  });

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(cleanSlides, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing hero slides to file:', err);
  }

  return cleanSlides;
}

export async function GET() {
  try {
    const slides = readSlidesFromFile();
    return NextResponse.json(
      { slides },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
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

    const inputSlides: HeroSlide[] = body.slides;
    const slides = writeSlidesToFile(inputSlides);

    return NextResponse.json(
      {
        message: 'Hero slides updated successfully!',
        slides,
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


