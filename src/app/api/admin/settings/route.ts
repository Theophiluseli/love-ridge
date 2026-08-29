import { NextRequest, NextResponse } from 'next/server';
import { getSystemSetting, setSystemSetting } from '@/lib/system-settings';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS = {
  siteName: 'Love Ridge Properties & Hardware Platform',
  contactPhone: '+233 24 123 4567',
  whatsappNumber: '+233 24 123 4567',
  contactEmail: 'info@loveridge.com',
  enableQuoteInquiries: true,
  enablePropertyBookings: true,
  currencySymbol: 'GHS',
};

export async function GET() {
  try {
    const { data: settings, isDefault } = await getSystemSetting('site_settings', DEFAULT_SETTINGS);
    return NextResponse.json({ settings, isDefault });
  } catch (error) {
    return NextResponse.json({ settings: DEFAULT_SETTINGS, isDefault: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await setSystemSetting('site_settings', body);
    return NextResponse.json({ message: 'Settings saved successfully', settings: body });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
