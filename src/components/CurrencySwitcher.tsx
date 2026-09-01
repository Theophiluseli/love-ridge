'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Coins } from 'lucide-react';
import { useCurrency, SupportedCurrency } from '@/context/CurrencyContext';

interface CurrencyOption {
  code: SupportedCurrency;
  label: string;
  symbol: string;
  flag: string;
}

const CURRENCIES: CurrencyOption[] = [
  { code: 'GHS', label: 'Ghana Cedi', symbol: 'GH₵', flag: '🇬🇭' },
  { code: 'USD', label: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', label: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', label: 'British Pound', symbol: '£', flag: '🇬🇧' },
];

export default function CurrencySwitcher({ className = '' }: { className?: string }) {
  const { currency, setCurrency, getSymbol } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Pill Button Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white text-emerald-950 hover:bg-emerald-50 font-black px-2.5 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 shadow-sm transition-all active:scale-[0.98] border border-slate-200 hover:border-emerald-400 shrink-0"
        title="Change Currency"
        aria-label="Currency Selector"
      >
        <span className="text-[10px] sm:text-xs font-black text-emerald-800 bg-emerald-100/90 px-1 sm:px-1.5 py-0.5 rounded-md leading-none">
          {currentOption.symbol}
        </span>
        <span className="font-extrabold tracking-wide">{currency}</span>
        <ChevronDown
          className={`w-3 h-3 text-emerald-800 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Currency Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-2xl shadow-slate-950/20 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center gap-1.5">
            <Coins className="w-3 h-3 text-emerald-700" /> Select Currency
          </div>
          <div className="space-y-0.5">
            {CURRENCIES.map((c) => {
              const isSelected = currency === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setCurrency(c.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-900 font-black border border-emerald-200 shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm leading-none">{c.flag}</span>
                    <div className="flex flex-col">
                      <span className="leading-tight font-extrabold text-slate-900">
                        {c.code} <span className="text-emerald-700 font-semibold">({c.symbol})</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">{c.label}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-800" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
