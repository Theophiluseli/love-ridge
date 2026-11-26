import { supabaseAdmin } from '@/lib/supabase-admin';

const DATA_URL_RE = /^data:(image\/(?:jpeg|jpg|png|webp|gif|avif));base64,([A-Za-z0-9+/=\s]+)$/;

const EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

/**
 * Moves an image that was saved inline as a `data:` URL into the Supabase `uploads` bucket and
 * returns its public URL. Anything that is not an inline image (a normal URL or path) is returned
 * unchanged, and so is the original value if storage is unavailable, so nothing is ever lost.
 */
export async function moveInlineImageToStorage(value: string, prefix = 'inline'): Promise<string> {
  if (typeof value !== 'string' || !value.startsWith('data:')) return value;
  const match = value.match(DATA_URL_RE);
  if (!match) return value;

  const mime = match[1] === 'image/jpg' ? 'image/jpeg' : match[1];
  const buffer = Buffer.from(match[2].replace(/\s/g, ''), 'base64');
  if (buffer.length === 0) return value;

  const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${EXT[mime] || '.jpg'}`;
  try {
    const { error } = await supabaseAdmin.storage
      .from('uploads')
      .upload(filename, buffer, { contentType: mime, upsert: false });
    if (error) {
      console.warn(`Could not move inline image to storage (${prefix}):`, error.message);
      return value;
    }
    return supabaseAdmin.storage.from('uploads').getPublicUrl(filename).data.publicUrl || value;
  } catch (err) {
    console.warn(`Could not move inline image to storage (${prefix}):`, err);
    return value;
  }
}
