import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { getAllCategories, saveCategory } from '@/lib/categories-store';
import { logAuditAction } from '@/lib/auth/audit';
import { broadcastCatalogUpdate } from '@/lib/realtime-broadcast';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'categories.manage');
  if ('response' in auth) return auth.response;

  try {
    const categories = await getAllCategories(true);
    return NextResponse.json({ categories, count: categories.length });
  } catch (error) {
    console.error('Admin fetch categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'categories.manage');
  if ('response' in auth) return auth.response;
  const user = auth.user;

  try {
    const body = await req.json();
    const { name, slug, description, imageUrl } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    const category = await saveCategory({
      name: name.trim(),
      slug: slug ? slug.trim() : undefined,
      description: description ? description.trim() : '',
      imageUrl: imageUrl ? imageUrl.trim() : '',
    });

    await logAuditAction({
      userId: user.userId,
      action: 'CATEGORY_CREATE',
      entityType: 'category',
      entityId: category.id,
      newValue: category,
    });

    // Broadcast real-time update to all connected clients
    broadcastCatalogUpdate('categories', 'INSERT', { category }).catch(() => null);

    return NextResponse.json({ message: 'Category created successfully', category }, { status: 201 });
  } catch (error: any) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create category.' }, { status: 500 });
  }
}
