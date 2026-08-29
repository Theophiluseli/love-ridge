import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, propertyId, productId, name, email, phone, message, inquiryType } = body;

    if (!name || !email || !phone || !message || !type) {
      return NextResponse.json({ error: 'Name, email, phone, message and type are required.' }, { status: 400 });
    }

    const formattedMessage = inquiryType
      ? `[Inquiry Type: ${inquiryType}]\n\n${message}`
      : message;

    const lead = await prisma.lead.create({
      data: {
        type: type || 'PROPERTY_VIEWING',
        propertyId: propertyId || null,
        productId: productId || null,
        name,
        email,
        phone,
        message: formattedMessage,
        status: 'NEW',
        source: body.source || 'website',
      },
    });

    return NextResponse.json({ message: 'Inquiry submitted successfully.', lead }, { status: 201 });
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json({ error: 'Failed to submit inquiry.' }, { status: 500 });
  }
}
