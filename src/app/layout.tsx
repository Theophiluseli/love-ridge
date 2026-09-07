import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import GoogleTranslator from '@/components/GoogleTranslator';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { PwaProvider } from '@/context/PwaContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Love Ridge Properties & Building Materials Store',
  description: 'Ghana’s premier dual-purpose platform combining real estate property listings in East Legon and direct imported porcelain tiles, marble, and construction tools.',
  manifest: '/manifest.json',
  themeColor: '#064e3b',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Loveridge',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Loveridge" />
        <meta name="theme-color" content="#064e3b" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <PwaProvider>
          <LanguageProvider>
            <CurrencyProvider>
              {children}
              <WhatsAppWidget />
              <GoogleTranslator />
            </CurrencyProvider>
          </LanguageProvider>
        </PwaProvider>
      </body>
    </html>
  );
}
