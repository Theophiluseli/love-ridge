import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    // Handle Multipart Form Data
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mime = file.type || 'image/jpeg';
      const ext = path.extname(file.name) || (mime.includes('png') ? '.png' : mime.includes('webp') ? '.webp' : '.jpg');
      const filename = `hero-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;

      // Try local file system write (works in local dev)
      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, buffer);
        return NextResponse.json({ url: `/uploads/${filename}`, filename });
      } catch (fsErr) {
        // Read-only filesystem on Vercel: safely return base64 data URL
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${mime};base64,${base64}`;
        return NextResponse.json({ url: dataUrl, filename });
      }
    }

    // Handle JSON Base64
    const body = await req.json();
    if (body.base64) {
      const matches = body.base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      let ext = '.jpg';
      let mime = 'image/jpeg';

      if (matches && matches.length === 3) {
        mime = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
        if (mime.includes('png')) ext = '.png';
        else if (mime.includes('webp')) ext = '.webp';
        else if (mime.includes('svg')) ext = '.svg';
      } else {
        const cleanBase64 = body.base64.replace(/^data:image\/\w+;base64,/, '');
        buffer = Buffer.from(cleanBase64, 'base64');
      }

      const filename = `hero-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;

      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, buffer);
        return NextResponse.json({ url: `/uploads/${filename}`, filename });
      } catch (fsErr) {
        // Read-only filesystem on Vercel: return base64 data URL directly
        const cleanBase64 = buffer.toString('base64');
        const dataUrl = `data:${mime};base64,${cleanBase64}`;
        return NextResponse.json({ url: dataUrl, filename });
      }
    }

    return NextResponse.json({ error: 'Invalid upload payload' }, { status: 400 });
  } catch (err: any) {
    console.error('Upload handler error:', err);
    return NextResponse.json({ error: err.message || 'Failed to upload image' }, { status: 500 });
  }
}
