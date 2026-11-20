/**
 * Conversion tracking helpers (Fix 7).
 *
 * GTM (GTM-K6J87JN7) loads GA4, Google Ads, the Meta Pixel and the TikTok Pixel. Those base tags
 * only record page views, so the site fires the conversion events itself:
 *   - every event is pushed to window.dataLayer (for GA4 / Google Ads tags inside GTM), and
 *   - the matching TikTok (ttq) and Meta (fbq) standard events are called directly once GTM has
 *     loaded those pixels.
 *
 * IMPORTANT: do NOT also create TikTok/Meta "Contact", "SubmitForm"/"Lead" or "ViewContent" event
 * tags inside GTM, or every conversion will be counted twice.
 */

type AnyFn = (...args: any[]) => void;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    ttq?: { track?: AnyFn; page?: AnyFn };
    fbq?: AnyFn;
  }
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function pushDataLayer(event: string, params: Record<string, unknown> = {}) {
  if (!isBrowser()) return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...params });
  } catch {
    /* tracking must never break the page */
  }
}

function tiktok(event: string, params?: Record<string, unknown>) {
  try {
    if (isBrowser() && typeof window.ttq?.track === 'function') {
      window.ttq.track(event, params);
    }
  } catch {
    /* ignore */
  }
}

function meta(event: string, params?: Record<string, unknown>) {
  try {
    if (isBrowser() && typeof window.fbq === 'function') {
      window.fbq('track', event, params);
    }
  } catch {
    /* ignore */
  }
}

export type ContactChannel = 'whatsapp' | 'call' | 'email';

/** Visitor clicked a WhatsApp, Call or email button. */
export function trackContact(channel: ContactChannel, context: { contentId?: string; contentName?: string; location?: string } = {}) {
  pushDataLayer('contact_click', {
    contact_channel: channel,
    content_id: context.contentId,
    content_name: context.contentName,
    click_location: context.location,
  });
  tiktok('Contact', context.contentId ? { content_id: context.contentId, content_type: 'product' } : undefined);
  meta('Contact');
}

/** Visitor successfully submitted the enquiry form. */
export function trackLead(context: { contentId?: string; contentName?: string; formType?: string } = {}) {
  pushDataLayer('generate_lead', {
    form_type: context.formType,
    content_id: context.contentId,
    content_name: context.contentName,
  });
  tiktok('SubmitForm', context.contentId ? { content_id: context.contentId, content_type: 'product' } : undefined);
  meta('Lead', context.contentName ? { content_name: context.contentName } : undefined);
}

/** Visitor opened a listing page. */
export function trackViewContent(item: { id: string; name: string; price?: number; currency?: string; category?: string }) {
  const value = typeof item.price === 'number' && isFinite(item.price) ? item.price : undefined;
  const currency = (item.currency || 'USD').toUpperCase();
  pushDataLayer('view_item', {
    content_id: item.id,
    content_name: item.name,
    content_category: item.category,
    value,
    currency,
  });
  tiktok('ViewContent', {
    content_id: item.id,
    content_type: 'product',
    content_name: item.name,
    value,
    currency,
  });
  meta('ViewContent', {
    content_ids: [item.id],
    content_type: 'product',
    content_name: item.name,
    value,
    currency,
  });
}

/** Footer newsletter signup (dataLayer only; not an ad-platform conversion). */
export function trackNewsletterSignup() {
  pushDataLayer('newsletter_signup');
}

/** Virtual page view for client-side (SPA) navigations. */
export function trackPageView(path: string) {
  pushDataLayer('virtual_page_view', { page_path: path, page_location: isBrowser() ? window.location.href : undefined });
}
