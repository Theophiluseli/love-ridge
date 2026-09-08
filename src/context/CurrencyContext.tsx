'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SupportedCurrency = 'GHS' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  formatPrice: (amount: number, originalCurrency?: string) => string;
  getSymbol: (c?: SupportedCurrency) => string;
  rates: Record<SupportedCurrency, number>;
  isLive: boolean;
  lastUpdated: string | null;
}

const DEFAULT_EXCHANGE_RATES_TO_GHS: Record<SupportedCurrency, number> = {
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
  rates: DEFAULT_EXCHANGE_RATES_TO_GHS,
  isLive: false,
  lastUpdated: null,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>('GHS');
  const [rates, setRates] = useState<Record<SupportedCurrency, number>>(DEFAULT_EXCHANGE_RATES_TO_GHS);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    // 1. Restore saved currency preference
    try {
      const saved = localStorage.getItem('loveridge_currency');
      if (saved && ['GHS', 'USD', 'EUR', 'GBP'].includes(saved)) {
        setCurrencyState(saved as SupportedCurrency);
      }
    } catch {
      // Ignore localStorage read errors (e.g. private mode)
    }

    // 2. Load cached live rates from localStorage if recent (< 12 hours) to avoid flicker
    try {
      const cachedRatesJson = localStorage.getItem('loveridge_cached_rates');
      if (cachedRatesJson) {
        const cached = JSON.parse(cachedRatesJson);
        const twelveHoursInMs = 12 * 60 * 60 * 1000;
        if (cached.timestamp && Date.now() - cached.timestamp < twelveHoursInMs && cached.rates) {
          setRates(cached.rates);
          setIsLive(true);
          if (cached.lastUpdated) setLastUpdated(cached.lastUpdated);
        }
      }
    } catch {
      // Ignore localStorage parse errors
    }

    // 3. Fetch fresh live exchange rates from our cached API route
    let isCancelled = false;

    async function fetchLiveRates() {
      try {
        const res = await fetch('/api/currency');
        if (!res.ok) return;

        const data = await res.json();
        if (!isCancelled && data && data.rates) {
          setRates(data.rates);
          setIsLive(Boolean(data.isLive));
          if (data.lastUpdated) {
            setLastUpdated(data.lastUpdated);
          }

          // Persist to local storage for instant loading next time
          try {
            localStorage.setItem(
              'loveridge_cached_rates',
              JSON.stringify({
                rates: data.rates,
                lastUpdated: data.lastUpdated,
                timestamp: Date.now(),
              })
            );
          } catch {
            // Ignore localStorage write errors
          }
        }
      } catch (err) {
        console.warn('[CurrencyContext] Could not refresh live exchange rates:', err);
      }
    }

    fetchLiveRates();

    return () => {
      isCancelled = true;
    };
  }, []);

  const setCurrency = (c: SupportedCurrency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('loveridge_currency', c);
    } catch {
      // Ignore localStorage write errors
    }
  };

  const formatPrice = (amount: number, originalCurrency: string = 'GHS'): string => {
    if (amount === undefined || amount === null || isNaN(amount)) return 'N/A';

    const orig = (originalCurrency.toUpperCase() as SupportedCurrency) || 'GHS';
    const rateFrom = rates[orig] || 1.0;
    const rateTo = rates[currency] || 1.0;

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
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        getSymbol,
        rates,
        isLive,
        lastUpdated,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

