import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { logAuditAction } from '@/lib/auth/audit';
import { getAllBusinesses, saveBusiness } from '@/lib/businesses-store';
import { broadcastCatalogUpdate } from '@/lib/realtime-broadcast';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'property.create');
  if ('response' in auth) return auth.response;

  try {
    const forceFresh = req.nextUrl.searchParams.get('refresh') === 'true';
    const businesses = await getAllBusinesses(forceFresh);
    return NextResponse.json(
      { businesses },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (err) {
    console.error('Failed to load businesses:', err);
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'property.create');
  if ('response' in auth) return auth.response;
  const user = auth.user;

  try {
    const body = await req.json();
    const {
      title,
      category = 'Real Property Rltd',
      summary,
      description,
      location,
      city = 'Accra',
      region = 'Greater Accra Region',
      askingPrice,
      downPayment,
      sellersDiscretionaryEarnings,
      grossRevenue,
      inventoryValue,
      currency = 'USD',
      establishedYear,
      employees,
      realEstateIncluded,
      reasonForSelling,
      facilitiesOverview,
      growthOpportunities,
      supportAndTraining,
      highlights = [],
      highlightsText,
      imageUrl,
      galleryUrls = [],
      status = 'PUBLISHED',
      featured = false,
      isFavourite = false,
      ownerName,
      ownerPhone,
      ownerEmail,
      ownerNotes,
      sourceUrl,
    } = body;

    if (!title || !String(title).trim()) {
      return NextResponse.json(
        { error: 'Please provide a business title.' },
        { status: 400 }
      );
    }

    if (status === 'PUBLISHED' && (askingPrice === undefined || askingPrice === null || askingPrice === '')) {
      return NextResponse.json(
        { error: 'Please provide an Asking Price to publish this business listing.' },
        { status: 400 }
      );
    }

    const savedBusiness = await saveBusiness({
      title: String(title).trim(),
      category: String(category || 'Real Property Rltd').trim(),
      summary: summary ? String(summary).trim() : '',
      description: description ? String(description).trim() : '',
      location: location ? String(location).trim() : `${city || 'Accra'}, ${region || 'Greater Accra Region'}`,
      city: city ? String(city).trim() : 'Accra',
      region: region ? String(region).trim() : 'Greater Accra Region',
      askingPrice,
      downPayment,
      sellersDiscretionaryEarnings,
      grossRevenue,
      inventoryValue,
      currency: currency || 'USD',
      establishedYear: establishedYear ? String(establishedYear).trim() : '',
      employees: employees ? String(employees).trim() : '',
      realEstateIncluded: realEstateIncluded ? String(realEstateIncluded).trim() : 'Real Property Included',
      reasonForSelling: reasonForSelling ? String(reasonForSelling).trim() : '',
      facilitiesOverview: facilitiesOverview ? String(facilitiesOverview).trim() : '',
      growthOpportunities: growthOpportunities ? String(growthOpportunities).trim() : '',
      supportAndTraining: supportAndTraining ? String(supportAndTraining).trim() : '',
      highlights,
      ...(highlightsText !== undefined ? { highlightsText } : {}),
      imageUrl: imageUrl || '',
      galleryUrls: Array.isArray(galleryUrls) ? galleryUrls : [],
      status,
      featured: Boolean(featured),
      isFavourite: Boolean(isFavourite),
      ownerName: ownerName ? String(ownerName).trim() : '',
      ownerPhone: ownerPhone ? String(ownerPhone).trim() : '',
      ownerEmail: ownerEmail ? String(ownerEmail).trim() : '',
      ownerNotes: ownerNotes ? String(ownerNotes).trim() : '',
      sourceUrl: sourceUrl ? String(sourceUrl).trim() : '',
    } as any);

    try {
      await logAuditAction({
        userId: user.userId,
        action: 'BUSINESS_CREATE',
        entityType: 'business',
        entityId: savedBusiness.id,
        newValue: savedBusiness,
      });
    } catch (e) {
      // ignore audit error
    }

    broadcastCatalogUpdate('businesses', 'INSERT').catch(() => null);

    return NextResponse.json(
      { message: 'Business listing created successfully', business: savedBusiness },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create business error:', error);
    return NextResponse.json({ error: 'Failed to create business listing.' }, { status: 500 });
  }
}

