import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'analytics.view');
  if ('response' in auth) return auth.response;

  try {
    const [
      totalProperties,
      publishedProperties,
      pendingProperties,
      totalProducts,
      lowStockProducts,
      totalLeads,
      newLeads,
      viewingLeads,
      quoteLeads,
      recentLeads,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: 'PUBLISHED' } }),
      prisma.property.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.product.count(),
      prisma.product.count({ where: { stockQuantity: { lte: 5 } } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'NEW' } }),
      prisma.lead.count({ where: { type: 'PROPERTY_VIEWING' } }),
      prisma.lead.count({ where: { type: 'PRODUCT_QUOTE' } }),
      prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { property: true, product: true },
      }),
    ]);

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
