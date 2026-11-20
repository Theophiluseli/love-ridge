// Server-only module (uses Prisma). Do not import from client components.
import { getAllProperties, getDeletedPropertyIds, sanitizePropertyForPublic, type PropertyItem } from './properties-store';
import { resolvePublishedListing } from './property-slugs';

export interface PublicListingResult {
  property: PropertyItem;
  similar: PropertyItem[];
  /** When set, the requested URL is outdated and should 301 to /properties/{redirectTo}. */
  redirectTo?: string;
}

function isPublished(p: PropertyItem) {
  return String(p.status || 'PUBLISHED').toUpperCase() === 'PUBLISHED';
}

/** All published, non-deleted listings in public (sanitised) form. */
export async function getPublishedListings(): Promise<PropertyItem[]> {
  const [all, deletedIds] = await Promise.all([getAllProperties(), getDeletedPropertyIds()]);
  return all.filter((p) => isPublished(p) && !deletedIds.has(p.id)).map(sanitizePropertyForPublic);
}

/**
 * Look up one published listing by slug for public pages and the public API.
 * Drafts, archived and deleted listings are never returned.
 */
export async function getPublicListing(slug: string): Promise<PublicListingResult | null> {
  const [all, deletedIds] = await Promise.all([getAllProperties(), getDeletedPropertyIds()]);
  const live = all.filter((p) => !deletedIds.has(p.id));
  const resolved = await resolvePublishedListing(slug, live);
  if (!resolved) return null;

  const current = resolved.property;
  const others = live.filter((p) => p.id !== current.id && isPublished(p));
  const score = (p: PropertyItem) =>
    (p.city && p.city === current.city ? 2 : 0) + (p.propertyType === current.propertyType ? 1 : 0) + (p.listingType === current.listingType ? 1 : 0);
  const similar = [...others].sort((a, b) => score(b) - score(a)).slice(0, 3);

  return {
    property: sanitizePropertyForPublic(current),
    similar: similar.map(sanitizePropertyForPublic),
    redirectTo: resolved.redirectTo,
  };
}
