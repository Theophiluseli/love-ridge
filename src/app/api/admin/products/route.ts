import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { logAuditAction } from '@/lib/auth/audit';

export async function GET(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'product.create');
  if ('response' in auth) return auth.response;

  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admin products.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'product.create');
  if ('response' in auth) return auth.response;
  const user = auth.user;

  try {
    const body = await req.json();
    const {
      name,
      description,
      categoryId,
      sku,
      price,
      currency = 'GHS',
      unit = 'per piece',
      stockQuantity = 0,
      stockStatus = 'IN_STOCK',
      originCountry = 'China',
      moq = 1,
      status = 'PUBLISHED',
      featured = false,
      imageUrl,
      galleryUrls = [],
    } = body;

    if (!name || !description || !categoryId || !sku || price === undefined) {
      return NextResponse.json({ error: 'Name, description, categoryId, SKU, and price are required.' }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        categoryId,
        sku,
        price: parseFloat(price),
        currency,
        unit,
        stockQuantity: parseInt(stockQuantity),
        stockStatus,
        originCountry,
        moq: parseInt(moq),
        status,
        featured: Boolean(featured),
        imageUrl: imageUrl || null,
        galleryUrls: Array.isArray(galleryUrls) ? galleryUrls : [],
        createdById: user.userId,
      },
    });

    await logAuditAction({
      userId: user.userId,
      action: 'PRODUCT_CREATE',
      entityType: 'product',
      entityId: product.id,
      newValue: product,
    });

    return NextResponse.json({ message: 'Product created successfully', product }, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A product with this SKU already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create product.' }, { status: 500 });
  }
}
