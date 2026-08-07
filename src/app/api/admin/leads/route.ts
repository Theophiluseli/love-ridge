import { NextRequest, NextResponse } from 'next/server';
import { requireAuthPermission } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await requireAuthPermission(req, 'leads.view');
  if ('response' in auth) return auth.response;
  const user = auth.user;

  try {
    let where: any = {};
    if (user.roleName === 'Agent' && !user.permissions.includes('leads.manage')) {
      where.assignedToId = user.userId;
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        property: { select: { id: true, title: true, slug: true } },
        product: { select: { id: true, name: true, slug: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ leads });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leads.' }, { status: 500 });
  }
}
