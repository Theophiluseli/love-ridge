import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'analytics.view');
  if ('response' in auth) return auth.response;

  try {
    const totalProperties = await prisma.property.count();
    const publishedProperties = await prisma.property.count({ where: { status: 'PUBLISHED' } });
    const pendingProperties = await prisma.property.count({ where: { status: 'PENDING_REVIEW' } });

    const totalProducts = await prisma.product.count();
    const lowStockProducts = await prisma.product.count({ where: { stockQuantity: { lte: 5 } } });

    const totalLeads = await prisma.lead.count();
    const newLeads = await prisma.lead.count({ where: { status: 'NEW' } });
    const viewingLeads = await prisma.lead.count({ where: { type: 'PROPERTY_VIEWING' } });
    const quoteLeads = await prisma.lead.count({ where: { type: 'PRODUCT_QUOTE' } });

    const recentLeads = await prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { property: true, product: true },
    });

    return NextResponse.json({
      kpis: {
        totalProperties,
        publishedProperties,
        pendingProperties,
        totalProducts,
        lowStockProducts,
        totalLeads,
        newLeads,
        viewingLeads,
        quoteLeads,
      },
      recentLeads,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics.' }, { status: 500 });
  }
}
