import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { broadcastCatalogUpdate } from '@/lib/realtime-broadcast';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

// GET: Single gallery item
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const item = await prisma.galleryItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// PUT / PATCH: Update gallery item
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const auth = await requireAuthPermission(req, 'content.manage');
  if ('response' in auth) return auth.response;

  try {
    const { id } = params;
    const body = await req.json();

    const existing = await prisma.galleryItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    const str = (v: unknown) => (v === null || v === undefined ? '' : String(v)).trim();
    const dataToUpdate: any = {};
    if (body.title !== undefined) {
      if (!str(body.title)) {
        return NextResponse.json({ error: 'Title is required for gallery image.' }, { status: 400 });
      }
      dataToUpdate.title = str(body.title);
    }
    if (body.imageUrl !== undefined) {
      if (!str(body.imageUrl)) {
        return NextResponse.json({ error: 'Image URL is required.' }, { status: 400 });
      }
      dataToUpdate.imageUrl = str(body.imageUrl);
    }
    if (body.description !== undefined) dataToUpdate.description = str(body.description);
    if (body.category !== undefined) dataToUpdate.category = str(body.category) || 'Trade Exhibitions';
    if (body.location !== undefined) dataToUpdate.location = str(body.location);
    if (body.eventDate !== undefined) dataToUpdate.eventDate = str(body.eventDate);
    if (body.featured !== undefined) dataToUpdate.featured = Boolean(body.featured);
    if (body.sortOrder !== undefined) dataToUpdate.sortOrder = Number(body.sortOrder) || 0;
    if (body.status !== undefined) dataToUpdate.status = ['PUBLISHED', 'DRAFT', 'ARCHIVED'].includes(body.status) ? body.status : 'PUBLISHED';

    const updated = await prisma.galleryItem.update({
      where: { id },
      data: dataToUpdate,
    });

    globalThis.__cachedGalleryData = null;

    // Broadcast change
    await broadcastCatalogUpdate('gallery', 'UPDATE', { id: updated.id });

    return NextResponse.json({
      message: 'Gallery item updated successfully!',
      item: updated,
    });
  } catch (error: any) {
    console.error('Error updating gallery item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update gallery item' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return PUT(req, ctx);
}

// DELETE: Remove gallery item
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const auth = await requireAuthPermission(req, 'content.manage');
  if ('response' in auth) return auth.response;

  try {
    const { id } = params;

    const existing = await prisma.galleryItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    await prisma.galleryItem.delete({
      where: { id },
    });

    globalThis.__cachedGalleryData = null;

    // Broadcast change
    await broadcastCatalogUpdate('gallery', 'DELETE', { id });

    return NextResponse.json({
      message: 'Gallery item deleted successfully!',
      success: true,
    });
  } catch (error: any) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete gallery item' },
      { status: 500 }
    );
  }
}
