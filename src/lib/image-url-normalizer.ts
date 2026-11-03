import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

declare global {
  var __inMemoryMediaBuffers: Map<string, { buffer: Buffer; mime: string }> | undefined;
}

function getMemoryMediaStore(): Map<string, { buffer: Buffer; mime: string }> {
  if (!globalThis.__inMemoryMediaBuffers) {
    globalThis.__inMemoryMediaBuffers = new Map();
  }
  return globalThis.__inMemoryMediaBuffers;
}

export function getInMemoryMedia(filename: string): { buffer: Buffer; mime: string } | undefined {
  return getMemoryMediaStore().get(filename);
}

const IMAGE_CACHE_VERSION = 'v=3';

function appendCacheVersion(url: string): string {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('/uploads/') && url.endsWith('.webp')) {
    return `${url}?${IMAGE_CACHE_VERSION}`;
  }
  if (url.startsWith('/uploads/') && url.includes('.webp?v=') && !url.endsWith(`?${IMAGE_CACHE_VERSION}`)) {
    return `${url.split('?')[0]}?${IMAGE_CACHE_VERSION}`;
  }
  return url;
}

/**
 * Converts inline base64 data URLs (`data:image/...;base64,...`) into fast static `/uploads/...`
 * URLs on disk (or `/api/media/...` binary URLs in read-only serverless environments).
 * This keeps API JSON payloads tiny (< 2KB per item instead of 1-2MB per item).
 */
export function normalizeImageUrl(dataUrl: string | null | undefined, prefix: string): string {
  if (!dataUrl || typeof dataUrl !== 'string') return '';
  if (!dataUrl.startsWith('data:')) return appendCacheVersion(dataUrl);

  try {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let mime = 'image/webp';
    let base64Data = '';

    if (matches && matches.length === 3) {
      mime = matches[1];
      base64Data = matches[2];
    } else {
      base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 8);
    const ext = mime.includes('png') ? '.png' : mime.includes('webp') ? '.webp' : '.jpg';
    const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `${safePrefix}-${hash}${ext}`;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      return appendCacheVersion(`/uploads/${filename}`);
    }

    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      fs.writeFileSync(filePath, buffer);
      return appendCacheVersion(`/uploads/${filename}`);
    } catch {
      // Read-only serverless filesystem fallback: store in memory and serve as binary via /api/media/[filename]
      getMemoryMediaStore().set(filename, { buffer, mime });
      return `/api/media/${filename}`;
    }
  } catch {
    return dataUrl;
  }
}

export function normalizeEntityImages<T extends { id: string; imageUrl?: string | null; galleryUrls?: string[] | null }>(
  item: T,
  entityPrefix = ''
): { item: T; changed: boolean } {
  let changed = false;
  const basePrefix = entityPrefix ? `${entityPrefix}-${item.id}` : item.id;

  let nextImageUrl = item.imageUrl;
  if (typeof nextImageUrl === 'string' && nextImageUrl.length > 0) {
    const clean = normalizeImageUrl(nextImageUrl, `${basePrefix}-cover`);
    if (clean !== item.imageUrl) {
      nextImageUrl = clean;
      changed = true;
    }
  }

  let nextGalleryUrls = item.galleryUrls;
  if (Array.isArray(item.galleryUrls)) {
    let galChanged = false;
    const mapped = item.galleryUrls.map((url, idx) => {
      if (typeof url === 'string' && url.length > 0) {
        const clean = normalizeImageUrl(url, `${basePrefix}-gal-${idx}`);
        if (clean !== url) galChanged = true;
        return clean;
      }
      return url;
    });
    if (galChanged) {
      nextGalleryUrls = mapped;
      changed = true;
    }
  }

  if (!changed) return { item, changed: false };

  return {
    item: {
      ...item,
      imageUrl: nextImageUrl,
      galleryUrls: nextGalleryUrls,
    },
    changed: true,
  };
}

