import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if already subscribed in leads
    const existing = await prisma.lead.findFirst({
      where: {
        email: cleanEmail,
        type: 'NEWSLETTER',
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'You are already subscribed to our newsletter! Thank you.' },
        { status: 200 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        type: 'NEWSLETTER',
        name: cleanEmail.split('@')[0] || 'Newsletter Subscriber',
        email: cleanEmail,
        phone: 'N/A',
        message: 'Subscribed to Loveridge newsletter & real estate updates.',
        source: 'footer_newsletter',
        status: 'NEW',
      },
    });

    return NextResponse.json(
      { message: 'Thank you for subscribing to our newsletter!', lead },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    );
  }
}
