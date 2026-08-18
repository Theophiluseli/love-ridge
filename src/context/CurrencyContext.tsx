'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SupportedCurrency = 'GHS' | 'USD' | 'EUR' | 'GBP';

interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  formatPrice: (amount: number, originalCurrency?: string) => string;
  getSymbol: (c?: SupportedCurrency) => string;
}

const EXCHANGE_RATES_TO_GHS: Record<SupportedCurrency, number> = {
  GHS: 1.0,
  USD: 15.5,
  EUR: 16.8,
  GBP: 19.8,
};

const SYMBOLS: Record<SupportedCurrency, string> = {
  GHS: 'GH₵',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'GHS',
  setCurrency: () => {},
  formatPrice: (amt) => `GH₵ ${amt.toLocaleString()}`,
  getSymbol: () => 'GH₵',
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>('GHS');

  useEffect(() => {
    const saved = localStorage.getItem('loveridge_currency');
    if (saved && ['GHS', 'USD', 'EUR', 'GBP'].includes(saved)) {
      setCurrencyState(saved as SupportedCurrency);
    }
  }, []);

  const setCurrency = (c: SupportedCurrency) => {
    setCurrencyState(c);
    localStorage.setItem('loveridge_currency', c);
  };

  const formatPrice = (amount: number, originalCurrency: string = 'GHS'): string => {
    if (amount === undefined || amount === null || isNaN(amount)) return 'N/A';

    const orig = (originalCurrency.toUpperCase() as SupportedCurrency) || 'GHS';
    const rateFrom = EXCHANGE_RATES_TO_GHS[orig] || 1.0;
    const rateTo = EXCHANGE_RATES_TO_GHS[currency] || 1.0;

    // Convert to GHS base first, then convert to target currency
    const amountInGhs = amount * rateFrom;
    const convertedAmount = amountInGhs / rateTo;

    const symbol = SYMBOLS[currency];
    const rounded = Math.round(convertedAmount);

    return `${symbol}${rounded.toLocaleString()}`;
  };

  const getSymbol = (c?: SupportedCurrency): string => {
    const target = c || currency;
    return SYMBOLS[target] || 'GH₵';
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, getSymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
