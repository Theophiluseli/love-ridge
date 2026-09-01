import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import GoogleTranslator from '@/components/GoogleTranslator';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { LanguageProvider } from '@/context/LanguageContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Love Ridge Properties & Building Materials Store',
  description: 'Ghana’s premier dual-purpose platform combining real estate property listings in East Legon and direct imported porcelain tiles, marble, and construction tools.',
  icons: {
    icon: '/logo-green.png',
    shortcut: '/logo-green.png',
    apple: '/logo-green.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <CurrencyProvider>
            {children}
            <WhatsAppWidget />
            <GoogleTranslator />
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
