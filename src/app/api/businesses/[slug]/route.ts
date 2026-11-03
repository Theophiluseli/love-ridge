import { NextRequest, NextResponse } from 'next/server';
import {
  getBusinessBySlug,
  getRelatedBusinesses,
  sanitizeBusinessForPublic,
} from '@/lib/businesses-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params?.slug;
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const business = await getBusinessBySlug(slug);
    if (!business || (business.status || 'PUBLISHED').toUpperCase() !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Business listing not found' }, { status: 404 });
    }

    const related = await getRelatedBusinesses(business, 2);

    return NextResponse.json(
      {
        business: sanitizeBusinessForPublic(business),
        related: related.map(sanitizeBusinessForPublic),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching business detail:', error);
    return NextResponse.json(
      { error: 'Failed to load business detail' },
      { status: 500 }
    );
  }
}

