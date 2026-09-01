import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { getAllProducts, saveProduct } from '@/lib/products-store';
import { logAuditAction } from '@/lib/auth/audit';

export async function GET(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'product.create');
  if ('response' in auth) return auth.response;

  try {
    const products = await getAllProducts();
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
      referenceUrl,
      price,
      priceCny,
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

    if (!name || !description || !categoryId || price === undefined) {
      return NextResponse.json({ error: 'Name, description, categoryId, and price are required.' }, { status: 400 });
    }

    const product = await saveProduct({
      name,
      description,
      categoryId,
      sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
      referenceUrl: referenceUrl || '',
      price: parseFloat(price),
      priceCny: priceCny !== undefined && priceCny !== '' ? parseFloat(priceCny) : undefined,
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
    return NextResponse.json({ error: 'Failed to create product.' }, { status: 500 });
  }
}
