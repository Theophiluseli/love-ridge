import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { saveProduct, deleteProduct, getAllProducts } from '@/lib/products-store';
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

    const products = await getAllProducts();
    const existing = products.find((p) => p.id === id);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const updated = await saveProduct({
      ...existing,
      ...body,
      id,
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
    const products = await getAllProducts();
    const existing = products.find((p) => p.id === id);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    await deleteProduct(id);

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
