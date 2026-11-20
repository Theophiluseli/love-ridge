import { MetadataRoute } from 'next';
import { SITE_URL, propertyUrl } from '@/lib/site-config';
import { getPublishedListings } from '@/lib/public-listings';

// Rebuild at most every 10 minutes so new listings appear quickly.
export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    '',
    '/properties',
    '/products',
    '/businesses',
    '/services',
    '/about',
    '/contact',
    '/gallery',
    '/privacy-policy',
    '/terms-and-conditions',
  ];

  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === '' || route === '/properties' || route === '/products' || route === '/businesses' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/properties' ? 0.9 : 0.7,
  }));

  // Every published listing (Fix 3).
  let listingEntries: MetadataRoute.Sitemap = [];
  try {
    const listings = await getPublishedListings();
    listingEntries = listings.map((p) => ({
      url: propertyUrl(p.slug),
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: 'weekly' as const,
      priority: p.featured || p.isFavourite ? 0.9 : 0.8,
    }));
  } catch (err) {
    console.error('Sitemap: could not load listings', err);
  }

  return [...staticEntries, ...listingEntries];
}
