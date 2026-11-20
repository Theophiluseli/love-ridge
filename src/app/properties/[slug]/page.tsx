import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import PropertyDetailClient from '@/components/PropertyDetailClient';
import { getPublicListing } from '@/lib/public-listings';
import { formatPropertyType, isResidentialProperty } from '@/lib/property-categories';
import { SITE_NAME, SITE_URL, BRAND_NAME, CALL_NUMBER_E164, absoluteUrl, propertyUrl } from '@/lib/site-config';
import type { PropertyItem } from '@/lib/properties-constants';

// Listings change from the admin panel at any time; render on request (data is cached in memory).
export const dynamic = 'force-dynamic';

type Props = { params: { slug: string } };

function cleanText(text: string) {
  return String(text || '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, '')}…`;
}

function shortAddress(p: PropertyItem) {
  const addr = String(p.locationAddress || '').replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
  const parts = addr.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 2);
  const base = parts.join(', ') || p.city;
  return p.city && !base.toLowerCase().includes(p.city.toLowerCase()) ? `${base}, ${p.city}` : base;
}

function buildDescription(p: PropertyItem) {
  const type = formatPropertyType(p.propertyType).toLowerCase();
  const purpose = String(p.listingType).toUpperCase() === 'RENT' && String(p.propertyType).toUpperCase() !== 'LAND' ? 'for rent' : 'for sale';
  const lead =
    isResidentialProperty(p.propertyType) && p.bedrooms > 0
      ? `${p.bedrooms}-bedroom ${type} ${purpose} in ${shortAddress(p)}.`
      : `${type.charAt(0).toUpperCase()}${type.slice(1)} ${purpose} in ${shortAddress(p)}.`;
  // Skip the first line of the description when it just repeats the title.
  const lines = String(p.description || '').split('\n').map((l) => l.trim()).filter(Boolean);
  const body = cleanText((lines.length > 1 && lines[0].length < 140 ? lines.slice(1) : lines).join(' '));
  return truncate(`${lead} ${body}`, 158);
}

function coverImage(p: PropertyItem) {
  return absoluteUrl(p.imageUrl || p.galleryUrls?.[0]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getPublicListing(params.slug);
  // Status codes must be decided here: generateMetadata resolves before the page starts
  // streaming (the root loading.tsx would otherwise force a 200 / client-side redirect).
  if (!result) notFound();
  if (result.redirectTo && result.redirectTo !== params.slug) {
    permanentRedirect(`/properties/${result.redirectTo}`);
  }
  const p = result.property;
  const title = `${p.title} | ${SITE_NAME}`;
  const description = buildDescription(p);
  const url = propertyUrl(p.slug);
  const image = coverImage(p);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: BRAND_NAME,
      locale: 'en_GH',
      type: 'website',
      images: image ? [{ url: image, alt: p.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

function buildJsonLd(p: PropertyItem) {
  const url = propertyUrl(p.slug);
  const images = [p.imageUrl, ...(p.galleryUrls || [])]
    .map((u) => absoluteUrl(u))
    .filter((u, i, arr): u is string => Boolean(u) && arr.indexOf(u) === i)
    .slice(0, 10);
  const isRent = String(p.listingType).toUpperCase() === 'RENT' && String(p.propertyType).toUpperCase() !== 'LAND';

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: p.title,
    description: cleanText(p.description).slice(0, 5000),
    url,
    image: images,
    datePosted: p.createdAt,
    dateModified: p.updatedAt,
    offers: {
      '@type': 'Offer',
      price: p.price,
      priceCurrency: (p.currency || 'USD').toUpperCase(),
      availability: 'https://schema.org/InStock',
      businessFunction: isRent ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell',
      url,
      seller: {
        '@type': 'RealEstateAgent',
        name: BRAND_NAME,
        url: SITE_URL,
        telephone: CALL_NUMBER_E164,
      },
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: shortAddress(p),
      addressLocality: p.city,
      addressRegion: p.region,
      addressCountry: 'GH',
    },
  };
  if (typeof p.lat === 'number' && typeof p.lng === 'number') {
    data.geo = { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng };
  }
  if (isResidentialProperty(p.propertyType) && p.bedrooms > 0) {
    data.numberOfBedrooms = p.bedrooms;
  }
  return data;
}

export default async function PropertyDetailPage({ params }: Props) {
  const result = await getPublicListing(params.slug);
  if (!result) notFound();
  // Old / renamed URLs: permanent redirect to the current address (Fix 2, Fix 6.4).
  if (result.redirectTo && result.redirectTo !== params.slug) {
    permanentRedirect(`/properties/${result.redirectTo}`);
  }

  const jsonLd = JSON.stringify(buildJsonLd(result.property)).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <PropertyDetailClient initialProperty={result.property} initialSimilar={result.similar} />
    </>
  );
}
