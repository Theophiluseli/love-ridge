import { NextRequest, NextResponse } from 'next/server';
import { getPublicListing } from '@/lib/public-listings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

/**
 * Public listing detail. Only PUBLISHED listings are returned, and only whitelisted public
 * fields (no owner/landlord details, commission or internal records) — Fix 6.1.
 */
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const result = await getPublicListing(params.slug);
    if (!result) {
      return NextResponse.json({ error: 'Property not found.' }, { status: 404, headers: NO_STORE });
    }
    return NextResponse.json(
      { property: result.property, similar: result.similar, canonicalSlug: result.property.slug },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error('Error fetching property detail:', error);
    return NextResponse.json({ error: 'Failed to fetch property details.' }, { status: 500, headers: NO_STORE });
  }
}
