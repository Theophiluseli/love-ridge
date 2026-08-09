import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';


const FALLBACK_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Italian Carrara Porcelain Floor Tiles (60x120cm)',
    slug: 'italian-60x120-porcelain-floor-tiles',
    description: 'Premium nano-polished porcelain floor tiles with authentic Carrara marble pattern.',
    sku: 'TILE-ITA-60120-CAR',
    price: 145.00,
    currency: 'GHS',
    unit: 'per box (1.44 sqm)',
    stockQuantity: 450,
    stockStatus: 'IN_STOCK',
    moq: 20,
    featured: true,
    category: { name: 'TILES & MARBLE SLABS' },
    imageUrl: '/product_tiles.png',
  },
  {
    id: 'prod-2',
    name: 'Industrial 20V Brushless Cordless Drill & Impact Driver Set',
    slug: 'industrial-20v-brushless-cordless-drill-kit',
    description: 'Heavy duty construction grade cordless power tool combo kit.',
    sku: 'TOOL-20V-DRILL-KIT',
    price: 1850.00,
    currency: 'GHS',
    unit: 'per set',
    stockQuantity: 35,
    stockStatus: 'IN_STOCK',
    moq: 1,
    featured: true,
    category: { name: 'TOOLS & CONSTRUCTION EQUIPMENT' },
    imageUrl: '/product_drill.png',
  },
  {
    id: 'prod-3',
    name: 'Smart Biometric Fingerprint & Keypad Front Door Lock',
    slug: 'smart-biometric-fingerprint-front-door-lock',
    description: 'High-security 5-in-1 smart lock. Unlocks via Fingerprint, Mobile App, Passcode, and Key.',
    sku: 'SEC-SMART-LOCK-01',
    price: 1200.00,
    currency: 'GHS',
    unit: 'per piece',
    stockQuantity: 15,
    stockStatus: 'IN_STOCK',
    moq: 5,
    featured: true,
    category: { name: 'TOOLS & CONSTRUCTION EQUIPMENT' },
    imageUrl: '/product_lock.png',
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const categorySlug = searchParams.get('category');
    const stockStatus = searchParams.get('stockStatus');
    const featured = searchParams.get('featured');

    const where: any = {
      status: 'PUBLISHED',
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (categorySlug && categorySlug !== 'ALL') {
      const category = await prisma.productCategory.findUnique({
        where: { slug: categorySlug },
        include: { children: true },
      });

      if (category) {
        const categoryIds = [category.id, ...category.children.map((c) => c.id)];
        where.categoryId = { in: categoryIds };
      }
    }

    if (stockStatus && stockStatus !== 'ALL') {
      where.stockStatus = stockStatus;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        media: { include: { media: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products, count: products.length });
  } catch (error) {
    console.error('Error fetching products, serving fallback:', error);
    const { searchParams } = new URL(req.url);
    const featuredOnly = searchParams.get('featured') === 'true';
    const list = featuredOnly ? FALLBACK_PRODUCTS.filter((p) => p.featured) : FALLBACK_PRODUCTS;
    return NextResponse.json({ products: list, count: list.length });
  }
}
