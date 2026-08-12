import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1] || req.cookies.get('loveridge_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid or expired session token.' }, { status: 401 });
    }

    const { newEmail } = await req.json();
    if (!newEmail || !newEmail.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Check if email is already taken by another user
    const existing = await prisma.user.findFirst({
      where: {
        email: newEmail,
        id: { not: payload.userId },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Email address is already in use.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: { email: newEmail },
    });

    return NextResponse.json({
      message: 'Admin email updated successfully!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error('Update email error:', error);
    return NextResponse.json({ error: 'Failed to update email address.' }, { status: 500 });
  }
}
