'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PublicBusinessItem } from '@/lib/businesses-constants';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  GHS: 'GH₵',
  EUR: '€',
  GBP: '£',
};

export function formatBusinessAmount(
  amount: number | null | undefined,
  currencyCode: string = 'USD'
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return 'N/A';
  }
  const code = (currencyCode || 'USD').toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] || '$';
  return `${symbol}${Math.round(Number(amount)).toLocaleString('en-US')}`;
}

export default function BusinessCard({ business }: { business: PublicBusinessItem }) {
  const currency = business.currency || 'USD';

  return (
    <Link
      href={`/businesses/${business.slug}`}
      className="group relative flex flex-col justify-between rounded-2xl bg-[#f4f6ee] hover:bg-[#edf1e4] border border-slate-900/10 hover:border-slate-900/25 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden text-slate-950"
    >
      {business.imageUrl ? (
        <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-200 border-b border-slate-900/10">
          <img
            src={business.imageUrl}
            alt={business.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {business.featured && (
            <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-emerald-950/90 text-amber-300 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
              Featured Opportunity
            </span>
          )}
        </div>
      ) : null}

      <div className="p-6 sm:p-8 md:p-9 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Sector / Category Label */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-sm sm:text-base font-normal text-slate-900 tracking-tight">
              {business.category || 'Real Property Rltd'}
            </span>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-900/5 group-hover:bg-emerald-900 group-hover:text-white text-slate-800 transition-colors shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>

          {/* Main Business Title */}
          <h2 className="text-2xl sm:text-3xl md:text-[32px] font-medium text-slate-950 leading-[1.22] tracking-tight group-hover:text-emerald-950 transition-colors">
            {business.title}
          </h2>

          {/* Horizontal Rule Divider */}
          <hr className="border-t border-slate-900/70 my-6 sm:my-7" />

          {/* Core Key-Value Details matching reference layout */}
          <div className="space-y-3 text-base sm:text-[17px] leading-snug text-slate-950">
            <p>
              <span className="font-normal text-slate-900">Location: </span>
              <strong className="font-bold text-slate-950">
                {business.location || `${business.city}, ${business.region}`}
              </strong>
            </p>

            <p>
              <span className="font-normal text-slate-900">Asking Price: </span>
              <strong className="font-bold text-slate-950">
                {formatBusinessAmount(business.askingPrice, currency)}
              </strong>
            </p>

            <p>
              <span className="font-normal text-slate-900">Down Payment: </span>
              <strong className="font-bold text-slate-950">
                {business.downPayment !== null && business.downPayment !== undefined
                  ? formatBusinessAmount(business.downPayment, currency)
                  : 'Upon Request'}
              </strong>
            </p>

            <p>
              <span className="font-normal text-slate-900">
                Sellers Discretionary Earnings:{' '}
              </span>
              <strong className="font-bold text-slate-950">
                {business.sellersDiscretionaryEarnings !== null &&
                business.sellersDiscretionaryEarnings !== undefined
                  ? formatBusinessAmount(business.sellersDiscretionaryEarnings, currency)
                  : 'Disclosed Upon NDA'}
              </strong>
            </p>
          </div>
        </div>

        {/* Subtle Footer Cue to Open Full Description */}
        <div className="mt-7 pt-4 border-t border-slate-900/10 flex items-center justify-between text-xs sm:text-sm font-semibold text-emerald-900 group-hover:text-emerald-700 transition-colors">
          <span>Click to view full business description & financials</span>
          <span className="inline-flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform">
            Open Details &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}

