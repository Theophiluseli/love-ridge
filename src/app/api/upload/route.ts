import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

function detectImageType(buf: Buffer): { mime: string; ext: string } | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: 'image/jpeg', ext: '.jpg' };
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return { mime: 'image/png', ext: '.png' };
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return { mime: 'image/webp', ext: '.webp' };
  if (buf.toString('ascii', 0, 4) === 'GIF8') return { mime: 'image/gif', ext: '.gif' };
  const brand = buf.toString('ascii', 4, 12);
  if (brand === 'ftypavif' || brand === 'ftypavis') return { mime: 'image/avif', ext: '.avif' };
  return null;
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'media.manage');
  if ('response' in auth) return auth.response;

  try {
    const contentType = req.headers.get('content-type') || '';
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    let buffer: Buffer;
    let mime = 'image/jpeg';
    let ext = '.jpg';
    let originalName = '';

    // 1. Handle Multipart Form Data
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      mime = file.type || 'image/jpeg';
      originalName = file.name || 'image';
      ext = path.extname(originalName) || (mime.includes('png') ? '.png' : mime.includes('webp') ? '.webp' : '.jpg');
    }
    // 2. Handle JSON Base64
    else {
      const body = await req.json();
      if (!body.base64) {
        return NextResponse.json({ error: 'Invalid upload payload' }, { status: 400 });
      }

      const matches = body.base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
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
    }

    // Only accept real raster images, identified by their file signature (not the client's claim).
    // SVG/HTML and other types are refused because they can carry scripts.
    if (!buffer || buffer.length === 0) {
      return NextResponse.json({ error: 'Empty upload.' }, { status: 400 });
    }
    if (buffer.length > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'Image is too large (max 15 MB). Please compress it and try again.' }, { status: 413 });
    }
    const detected = detectImageType(buffer);
    if (!detected) {
      return NextResponse.json({ error: 'Only JPG, PNG, WebP, GIF or AVIF images can be uploaded.' }, { status: 415 });
    }
    mime = detected.mime;
    ext = detected.ext;

    const uniqueHash = Math.random().toString(36).substring(2, 8);
    const filename = `upload-${Date.now()}-${uniqueHash}${ext}`;

    // Priority 1: Upload directly to Supabase Storage bucket 'uploads' (Global High-Speed CDN)
    try {
      const { data, error } = await supabaseAdmin.storage
        .from('uploads')
        .upload(filename, buffer, { contentType: mime, upsert: true });

      if (!error && data) {
        const { data: pub } = supabaseAdmin.storage.from('uploads').getPublicUrl(filename);
        return NextResponse.json({ url: pub.publicUrl, filename });
      }
      if (error) {
        console.warn('Supabase storage upload error, falling back to local:', error.message);
      }
    } catch (storageErr) {
      console.warn('Supabase storage exception, falling back to local:', storageErr);
    }

    // Priority 2: Local file system write (fallback for offline/local development)
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);
      return NextResponse.json({ url: `/uploads/${filename}`, filename });
    } catch (fsErr) {
      // Last resort: only if storage AND disk both fail
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${mime};base64,${base64}`;
      return NextResponse.json({ url: dataUrl, filename });
    }
  } catch (err: any) {
    console.error('Upload handler error:', err);
    return NextResponse.json({ error: err.message || 'Failed to upload image' }, { status: 500 });
  }
}
