import { NextRequest, NextResponse } from 'next/server';
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
  try {
    const { id } = params;
    const body = await req.json();

    const existing = await prisma.galleryItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (body.title !== undefined) dataToUpdate.title = body.title.trim();
    if (body.description !== undefined) dataToUpdate.description = body.description.trim();
    if (body.imageUrl !== undefined) dataToUpdate.imageUrl = body.imageUrl.trim();
    if (body.category !== undefined) dataToUpdate.category = body.category.trim();
    if (body.location !== undefined) dataToUpdate.location = body.location.trim();
    if (body.eventDate !== undefined) dataToUpdate.eventDate = body.eventDate.trim();
    if (body.featured !== undefined) dataToUpdate.featured = Boolean(body.featured);
    if (body.sortOrder !== undefined) dataToUpdate.sortOrder = Number(body.sortOrder);
    if (body.status !== undefined) dataToUpdate.status = body.status;

    const updated = await prisma.galleryItem.update({
      where: { id },
      data: dataToUpdate,
    });

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
