import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

const ALLOWED_TYPES = new Set(['PROPERTY_VIEWING', 'PRODUCT_QUOTE', 'GENERAL_CONTACT', 'BUSINESS_INQUIRY']);
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

function str(value: unknown, max: number): string {
  return typeof value === 'string' ? value.replace(/\u0000/g, '').trim().slice(0, max) : '';
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = rateLimit(`lead:${ip}`, 8, 10 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many enquiries from this connection. Please try again shortly or contact us on WhatsApp.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    // Honeypot: silently accept and drop bot submissions.
    if (str(body.website, 200)) {
      return NextResponse.json({ message: 'Inquiry submitted successfully.' }, { status: 201 });
    }

    // Forms send slightly different shapes (home page sends its dropdown label as `type`,
    // the business page sends `fullName` and no type). Normalise them all here.
    const rawTypeText = str(body.type, 80);
    const rawType = rawTypeText.toUpperCase();
    let inquiryType = str(body.inquiryType, 80);
    let type: string;
    if (ALLOWED_TYPES.has(rawType)) {
      type = rawType;
    } else if (/BUSINESS/i.test(rawTypeText) || /BUSINESS/i.test(inquiryType)) {
      type = 'BUSINESS_INQUIRY';
    } else {
      type = 'GENERAL_CONTACT';
      if (rawTypeText && !inquiryType) inquiryType = rawTypeText;
    }
    const name = str(body.name, 100) || str(body.fullName, 100);
    const email = str(body.email, 254).toLowerCase();
    const phone = str(body.phone, 30);
    const subject = str(body.subject, 200);
    const baseMessage = str(body.message, 4000);
    const message = subject ? `${subject}\n${baseMessage}` : baseMessage;
    const preferredDate = str(body.preferredDate, 20);
    const preferredTime = str(body.preferredTime, 40);
    const propertyId = str(body.propertyId, 100) || null;
    const productId = str(body.productId, 100) || null;

    if (!name || !phone || !message) {
      return NextResponse.json({ error: 'Please provide your name, phone number and a message.' }, { status: 400 });
    }
    if ((phone.match(/\d/g) || []).length < 7 || !/^[+\d\s().-]+$/.test(phone)) {
      return NextResponse.json({ error: 'Please enter a valid phone / WhatsApp number.' }, { status: 400 });
    }
    if (email && !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address, or leave it blank.' }, { status: 400 });
    }

    const scheduleParts: string[] = [];
    if (preferredDate) scheduleParts.push(`Date: ${preferredDate}`);
    if (preferredTime) scheduleParts.push(`Time: ${preferredTime}`);
    const prefixParts: string[] = [];
    if (inquiryType) prefixParts.push(`[Inquiry Type: ${inquiryType}]`);
    if (scheduleParts.length) prefixParts.push(`[Preferred Schedule: ${scheduleParts.join(' | ')}]`);
    const formattedMessage = prefixParts.length ? `${prefixParts.join('\n')}\n\n${message}` : message;

    const data = {
      type,
      name,
      email,
      phone,
      message: formattedMessage,
      preferredDate: preferredDate || null,
      preferredTime: preferredTime || null,
      status: 'NEW',
      source: str(body.source, 60) || 'website',
    };

    let lead;
    try {
      lead = await prisma.lead.create({ data: { ...data, propertyId, productId }, select: { id: true } });
    } catch (relationErr) {
      // Listing ids that are not in the relational table (e.g. legacy cached items) must not lose the lead.
      lead = await prisma.lead.create({
        data: {
          ...data,
          message: `${formattedMessage}\n\n[Ref: ${propertyId || productId || 'n/a'}]`,
        },
        select: { id: true },
      });
    }

    return NextResponse.json({ message: 'Inquiry submitted successfully.', id: lead.id }, { status: 201 });
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json({ error: 'Failed to submit inquiry. Please contact us on WhatsApp.' }, { status: 500 });
  }
}
