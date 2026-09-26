import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { broadcastCatalogUpdate } from '@/lib/realtime-broadcast';

export const dynamic = 'force-dynamic';

const DEFAULT_GALLERY_ITEMS = [
  {
    id: 'gallery-kl-expo-01',
    title: 'Kuala Lumpur International Investment Expo',
    description: 'Loveridge consulting team engaging global property investors and cross-border partners at the Kuala Lumpur Aijabei Pavilion.',
    imageUrl: '/gallery/kl-expo-consultation.jpg',
    category: 'Trade Exhibitions',
    location: 'Kuala Lumpur, Malaysia',
    eventDate: 'April 2025',
    featured: true,
    sortOrder: 1,
    status: 'PUBLISHED',
  },
  {
    id: 'gallery-canton-fair-02',
    title: '137th Canton Fair Materials & Edge Banding Sourcing',
    description: 'Direct factory inspection of premium ABS/PVC edge banding, architectural profiles, and precision hardware for building projects.',
    imageUrl: '/gallery/canton-fair-materials.jpg',
    category: 'Material Sourcing',
    location: 'Guangzhou, China',
    eventDate: 'May 2025',
    featured: true,
    sortOrder: 2,
    status: 'PUBLISHED',
  },
  {
    id: 'gallery-global-partnership-03',
    title: 'Cross-Border Portfolio Consultation & Due Diligence',
    description: 'Executive strategy sessions guiding clients on global residency, luxury property acquisitions, and foreign exchange hedging.',
    imageUrl: '/gallery/global-partnership-meeting.jpg',
    category: 'Client Advisory',
    location: 'Hong Kong Financial District',
    eventDate: 'June 2025',
    featured: true,
    sortOrder: 3,
    status: 'PUBLISHED',
  },
  {
    id: 'gallery-client-advisory-04',
    title: 'Executive Client Contract Review & Advisory',
    description: 'In-depth contract review, deed verification, and real estate investment structuring for prospective homeowners and corporate partners.',
    imageUrl: '/gallery/client-document-advisory.jpg',
    category: 'Client Advisory',
    location: 'Loveridge Executive Suite',
    eventDate: 'July 2025',
    featured: true,
    sortOrder: 4,
    status: 'PUBLISHED',
  },
  {
    id: 'gallery-hardware-samples-05',
    title: 'Architectural Profiles & Color Swatches Inspection',
    description: 'Rigorous quality control and custom finish selections for luxury residential and commercial developments in Ghana.',
    imageUrl: '/gallery/hardware-samples-inspection.jpg',
    category: 'Material Sourcing',
    location: 'Guangzhou International Trade Center',
    eventDate: 'August 2025',
    featured: true,
    sortOrder: 5,
    status: 'PUBLISHED',
  },
  {
    id: 'gallery-trade-hub-06',
    title: 'Loveridge Global Trade Consultation Hub',
    description: 'High-level delegation meetings exploring supply chain logistics, direct factory bulk purchases, and turn-key development packages.',
    imageUrl: '/gallery/executive-consultation-session.jpg',
    category: 'Trade Exhibitions',
    location: 'Global Trade Center',
    eventDate: 'September 2025',
    featured: true,
    sortOrder: 6,
    status: 'PUBLISHED',
  },
];

// GET: Fetch gallery items with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const includeAll = searchParams.get('includeAll') === 'true';

    // Build Prisma query filter
    const where: any = {};

    if (!includeAll) {
      where.status = 'PUBLISHED';
    }

    if (category && category !== 'All') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ];
    }

    let items = await prisma.galleryItem.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    // If database table is completely empty, auto-seed defaults
    if (items.length === 0 && !category && !search) {
      const totalCount = await prisma.galleryItem.count();
      if (totalCount === 0) {
        for (const item of DEFAULT_GALLERY_ITEMS) {
          await prisma.galleryItem.create({ data: item });
        }
        items = await prisma.galleryItem.findMany({
          where,
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
      }
    }

    // Extract unique categories across published/all items
    const allCategoriesRaw = await prisma.galleryItem.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    const categories = Array.from(
      new Set(['All', ...allCategoriesRaw.map((c) => c.category).filter(Boolean)])
    );

    return NextResponse.json(
      { items, total: items.length, categories },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching gallery items:', error);
    // Graceful fallback to default items if DB temporarily unavailable
    return NextResponse.json({
      items: DEFAULT_GALLERY_ITEMS,
      total: DEFAULT_GALLERY_ITEMS.length,
      categories: ['All', 'Trade Exhibitions', 'Material Sourcing', 'Client Advisory'],
      fallback: true,
    });
  }
}

// POST: Create a new gallery photo item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      description = '',
      imageUrl,
      category = 'Trade Exhibitions',
      location = '',
      eventDate = '',
      featured = true,
      sortOrder,
      status = 'PUBLISHED',
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required for gallery image.' }, { status: 400 });
    }

    if (!imageUrl || !imageUrl.trim()) {
      return NextResponse.json({ error: 'Image URL is required.' }, { status: 400 });
    }

    // Calculate next sort order if not specified
    let finalOrder = sortOrder;
    if (finalOrder === undefined || finalOrder === null) {
      const maxItem = await prisma.galleryItem.findFirst({
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });
      finalOrder = (maxItem?.sortOrder ?? 0) + 1;
    }

    const newItem = await prisma.galleryItem.create({
      data: {
        title: title.trim(),
        description: (description || '').trim(),
        imageUrl: imageUrl.trim(),
        category: (category || 'Trade Exhibitions').trim(),
        location: (location || '').trim(),
        eventDate: (eventDate || '').trim(),
        featured: Boolean(featured),
        sortOrder: Number(finalOrder) || 0,
        status: status || 'PUBLISHED',
      },
    });

    // Broadcast change to all clients via Supabase Realtime
    await broadcastCatalogUpdate('gallery', 'INSERT', { id: newItem.id });

    return NextResponse.json(
      { message: 'Gallery photo created successfully!', item: newItem },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create gallery photo' },
      { status: 500 }
    );
  }
}
