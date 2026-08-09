import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { logAuditAction } from '@/lib/auth/audit';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuthPermission(req, 'product.edit');
  if ('response' in auth) return auth.response;
  const user = auth.user;

  try {
    const { id } = params;
    const body = await req.json();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        description: body.description ?? existing.description,
        categoryId: body.categoryId ?? existing.categoryId,
        price: body.price !== undefined ? parseFloat(body.price) : existing.price,
        unit: body.unit ?? existing.unit,
        stockQuantity: body.stockQuantity !== undefined ? parseInt(body.stockQuantity) : existing.stockQuantity,
        stockStatus: body.stockStatus ?? existing.stockStatus,
        originCountry: body.originCountry ?? existing.originCountry,
        moq: body.moq !== undefined ? parseInt(body.moq) : existing.moq,
        status: body.status ?? existing.status,
        featured: body.featured !== undefined ? Boolean(body.featured) : existing.featured,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : existing.imageUrl,
        galleryUrls: Array.isArray(body.galleryUrls) ? body.galleryUrls : existing.galleryUrls,
      },
    });

    await logAuditAction({
      userId: user.userId,
      action: 'PRODUCT_UPDATE',
      entityType: 'product',
      entityId: id,
      oldValue: existing,
      newValue: updated,
    });

    return NextResponse.json({ message: 'Product updated successfully', product: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuthPermission(req, 'product.delete');
  if ('response' in auth) return auth.response;
  const user = auth.user;

  try {
    const { id } = params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });

    await logAuditAction({
      userId: user.userId,
      action: 'PRODUCT_DELETE',
      entityType: 'product',
      entityId: id,
      oldValue: existing,
    });

    return NextResponse.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product.' }, { status: 500 });
  }
}
