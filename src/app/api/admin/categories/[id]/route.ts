import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { getAllCategories, saveCategory, deleteCategory } from '@/lib/categories-store';
import { logAuditAction } from '@/lib/auth/audit';
import { broadcastCatalogUpdate } from '@/lib/realtime-broadcast';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuthPermission(req, 'categories.manage');
  if ('response' in auth) return auth.response;
  const user = auth.user;

  try {
    const { id } = params;
    const body = await req.json();

    const categories = await getAllCategories();
    const existing = categories.find((c) => c.id === id);
    if (!existing) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    const updated = await saveCategory({
      ...existing,
      ...body,
      id,
    });

    await logAuditAction({
      userId: user.userId,
      action: 'CATEGORY_UPDATE',
      entityType: 'category',
      entityId: id,
      oldValue: existing,
      newValue: updated,
    });

    // Broadcast real-time update to all connected clients
    broadcastCatalogUpdate('categories', 'UPDATE', { category: updated }).catch(() => null);

    return NextResponse.json({ message: 'Category updated successfully', category: updated });
  } catch (error: any) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update category.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuthPermission(req, 'categories.manage');
  if ('response' in auth) return auth.response;
  const user = auth.user;

  try {
    const { id } = params;
    const categories = await getAllCategories();
    const existing = categories.find((c) => c.id === id);
    if (!existing) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    const { success, affectedProductsCount } = await deleteCategory(id);

    await logAuditAction({
      userId: user.userId,
      action: 'CATEGORY_DELETE',
      entityType: 'category',
      entityId: id,
      oldValue: existing,
    });

    // Broadcast real-time update to all connected clients
    broadcastCatalogUpdate('categories', 'DELETE', { categoryId: id }).catch(() => null);

    return NextResponse.json({
      message: 'Category deleted successfully.',
      affectedProductsCount,
    });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete category.' }, { status: 500 });
  }
}
