/**
 * Single source of truth for public-facing site constants.
 * Safe to import from both server and client components (no secrets here).
 */

// Canonical origin. The apex domain 308-redirects to www on Vercel, so www is canonical.
export const SITE_URL = 'https://www.loveridgeproperty.com';
export const SITE_NAME = 'Loveridge Properties';
export const BRAND_NAME = 'Loveridge Properties & Consult';

// Google Tag Manager container (GA4, Google Ads, Meta Pixel and TikTok Pixel are configured inside it).
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-K6J87JN7';

// WhatsApp enquiries go to the automated Serlzo assistant (Fix 8). Digits only, international format.
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '233534343444').replace(/[^0-9]/g, '');
export const WHATSAPP_DISPLAY = '+233 53 434 3444';

// Phone calls stay on the office line.
export const CALL_NUMBER_E164 = '+233246432493';
export const CALL_NUMBER_DISPLAY = '+233 24 643 2493';

export const CONTACT_EMAIL = 'info@loveridgeproperty.com';

export function buildWhatsAppLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function propertyUrl(slug: string): string {
  return `${SITE_URL}/properties/${slug}`;
}

/** Message format required by the Serlzo assistant so it knows which listing the enquiry is about. */
export function listingWhatsAppMessage(title: string, url: string): string {
  return `Hello, I am interested in ${title} ${url}`;
}

/** Turns a relative upload path into an absolute URL (for Open Graph / JSON-LD). */
export function absoluteUrl(pathOrUrl?: string | null): string | undefined {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (pathOrUrl.startsWith('data:')) return undefined;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}
