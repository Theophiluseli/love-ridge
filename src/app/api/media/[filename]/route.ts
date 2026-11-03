import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getInMemoryMedia } from '@/lib/image-url-normalizer';

export async function GET(
  _req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const filename = path.basename(params.filename || '');
  if (!filename) {
    return new NextResponse('Not found', { status: 404 });
  }

  // 1. Check in-memory store
  const mem = getInMemoryMedia(filename);
  if (mem) {
    return new NextResponse(new Uint8Array(mem.buffer), {
      status: 200,
      headers: {
        'Content-Type': mem.mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  // 2. Check public/uploads on disk
  const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
  if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    const mime =
      ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg';
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  return new NextResponse('Not found', { status: 404 });
}

