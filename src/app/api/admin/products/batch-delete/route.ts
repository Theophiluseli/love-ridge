import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { deleteProduct, getAllProducts } from '@/lib/products-store';
import { logAuditAction } from '@/lib/auth/audit';
import { broadcastCatalogUpdate } from '@/lib/realtime-broadcast';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'product.delete');
  if ('response' in auth) return auth.response;
  const user = auth.user;

  try {
    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No product IDs provided for deletion.' }, { status: 400 });
    }

    const allProducts = await getAllProducts();
    let deletedCount = 0;

    for (const id of ids) {
      const existing = allProducts.find((p) => p.id === id);
      await deleteProduct(id);
      deletedCount++;

      if (existing) {
        logAuditAction({
          userId: user.userId,
          action: 'PRODUCT_DELETE',
          entityType: 'product',
          entityId: id,
          oldValue: existing,
        }).catch(() => null);
      }
    }

    // Broadcast real-time catalog update once for the entire batch
    broadcastCatalogUpdate('products', 'DELETE').catch(() => null);

    return NextResponse.json({
      message: `Successfully deleted ${deletedCount} products.`,
      count: deletedCount,
      success: true,
    });
  } catch (error: any) {
    console.error('Batch delete products error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to batch delete products.' },
      { status: 500 }
    );
  }
}
