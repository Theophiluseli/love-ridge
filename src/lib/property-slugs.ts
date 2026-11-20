/**
 * Listing URL (slug) helpers — Fix 2 and Fix 6.4.
 *
 * - Clean slugs are generated from the title when a listing is published.
 * - Placeholder "untitled-…" slugs are never kept on a published listing.
 * - Whenever a slug changes, the old slug is remembered (system_settings
 *   "property_slug_redirects") and permanently redirected to the current one,
 *   so ads, WhatsApp shares and Google results keep working.
 */
import { getSystemSetting, setSystemSetting } from './system-settings';

export const SLUG_REDIRECTS_SETTING_KEY = 'property_slug_redirects';

/**
 * The three published listings that went live with placeholder slugs (Nov 2026 brief).
 * Static 301s for these live in next.config.js. Mapping the new slug to the listing id here
 * lets the new URL work immediately after deploy, even before the database rename script runs.
 */
export const LEGACY_SLUG_ALIASES: Record<string, { id: string; slug: string }> = {
  'untitled-property-listing-draft-5823': {
    id: 'prop-1788673496508',
    slug: '6-bedroom-house-pool-peduase-aburi',
  },
  'untitled-property-listing-draft-1008': {
    id: 'prop-1791596202249',
    slug: '4-bedroom-house-pool-for-sale-east-legon',
  },
  'untitled-property-listing-draft-9116': {
    id: 'prop-1790872421842',
    slug: '3-bedroom-house-boys-quarters-for-sale-lakeside-accra',
  },
};

export function slugify(input: string, maxLength = 80): string {
  const base = String(input || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (base.length <= maxLength) return base;
  const cut = base.slice(0, maxLength);
  const lastDash = cut.lastIndexOf('-');
  return (lastDash > 20 ? cut.slice(0, lastDash) : cut).replace(/-+$/g, '');
}

export function isPlaceholderSlug(slug?: string | null): boolean {
  return /^untitled(-|$)/i.test(String(slug || ''));
}

export function isPlaceholderTitle(title?: string | null): boolean {
  const t = String(title || '').trim().toLowerCase();
  return !t || t.startsWith('untitled property');
}

/** Slug that public pages should link to (bridges legacy slugs before the DB rename runs). */
export function publicSlugFor(property: { id: string; slug: string }): string {
  const alias = LEGACY_SLUG_ALIASES[property.slug];
  if (alias && alias.id === property.id) return alias.slug;
  return property.slug;
}

/** Build a unique slug from a title, adding -2, -3… only when another listing already uses it. */
export function generateUniqueSlug(
  title: string,
  existing: Array<{ id: string; slug: string }>,
  excludeId?: string,
  preferred?: string
): string {
  const taken = new Set(
    existing.filter((p) => p.id !== excludeId).map((p) => String(p.slug || '').toLowerCase())
  );
  const root = preferred || slugify(title) || `property-${Date.now().toString().slice(-6)}`;
  if (!taken.has(root)) return root;
  for (let i = 2; i < 500; i++) {
    const candidate = `${root}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${root}-${Date.now().toString().slice(-6)}`;
}

export async function getSlugRedirects(): Promise<Record<string, string>> {
  try {
    const { data } = await getSystemSetting<Record<string, string>>(SLUG_REDIRECTS_SETTING_KEY, {});
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

/** Remember that `oldSlug` used to point at listing `propertyId`. */
export async function recordSlugRedirect(oldSlug: string, propertyId: string): Promise<void> {
  const key = String(oldSlug || '').toLowerCase().trim();
  if (!key || !propertyId) return;
  try {
    const current = await getSlugRedirects();
    if (current[key] === propertyId) return;
    await setSystemSetting(SLUG_REDIRECTS_SETTING_KEY, { ...current, [key]: propertyId });
  } catch (err) {
    console.error('Failed to record slug redirect:', err);
  }
}

export interface ResolvedListing<T> {
  property: T;
  /** Set when the visitor should be permanently redirected to this slug. */
  redirectTo?: string;
}

/**
 * Find a PUBLISHED listing for a requested slug. Handles current slugs, renamed slugs,
 * the legacy aliases above, and old links that used the listing id.
 */
export async function resolvePublishedListing<T extends { id: string; slug: string; status?: string }>(
  requested: string,
  all: T[]
): Promise<ResolvedListing<T> | null> {
  let clean = '';
  try {
    clean = decodeURIComponent(String(requested || '')).toLowerCase().trim();
  } catch {
    clean = String(requested || '').toLowerCase().trim();
  }
  if (!clean) return null;

  const published = all.filter((p) => String(p.status || 'PUBLISHED').toUpperCase() === 'PUBLISHED');
  const byId = (id: string) => published.find((p) => p.id.toLowerCase() === id.toLowerCase());

  const direct = published.find((p) => String(p.slug).toLowerCase() === clean);
  if (direct) {
    const preferred = publicSlugFor(direct);
    return preferred !== direct.slug && preferred !== clean ? { property: direct, redirectTo: preferred } : { property: direct };
  }

  // New slug requested before the database rename has run.
  const aliasTarget = Object.values(LEGACY_SLUG_ALIASES).find((a) => a.slug === clean);
  if (aliasTarget) {
    const p = byId(aliasTarget.id);
    if (p) return p.slug.toLowerCase() === clean || isPlaceholderSlug(p.slug) ? { property: p } : { property: p, redirectTo: p.slug };
  }

  // Previously used slug that has since been renamed.
  const legacy = LEGACY_SLUG_ALIASES[clean];
  const redirects = await getSlugRedirects();
  const redirectId = redirects[clean] || legacy?.id;
  if (redirectId) {
    const p = byId(redirectId);
    if (p) return { property: p, redirectTo: publicSlugFor(p) };
  }

  // Old links that used the listing id.
  const idMatch = byId(clean);
  if (idMatch) return { property: idMatch, redirectTo: publicSlugFor(idMatch) };

  return null;
}
