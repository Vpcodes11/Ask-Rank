'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { PLAN_CARDS, formatPrice, type Currency, type PlanId } from '@/lib/plans';

export default function PricingTable({ currentPlan = 'free', defaultCurrency = 'USD' }: { currentPlan?: PlanId; defaultCurrency?: Currency }) {
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);

  return (
    <div className="py-6">
      <div className="flex items-center justify-center gap-2 mb-10 text-xs font-semibold">
        {(['USD', 'INR'] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCurrency(c)}
            className={`px-3 py-1.5 rounded-full border ${currency === c ? 'bg-emerald-500 text-slate-950 border-emerald-500' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
          >
            {c === 'USD' ? 'Global ($ USD)' : 'India (₹ INR)'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLAN_CARDS.map((p) => {
          const price = p.id === 'free' ? (currency === 'INR' ? '₹0' : '$0') : formatPrice(p.id, currency);
          const isCurrent = p.id !== 'report' && p.id === currentPlan && p.id !== 'free';
          const popular = 'popular' in p && p.popular;
          return (
            <div
              key={p.id}
              className={`relative rounded-2xl flex flex-col p-6 ${popular ? 'bg-slate-900 border-2 border-emerald-500 shadow-xl shadow-emerald-500/10' : 'bg-slate-900/80 border border-slate-800'}`}
            >
              {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">Most popular</div>
              )}
              <h3 className="text-base font-bold text-white">{p.name}</h3>
              <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{p.blurb}</p>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-3xl font-black text-white">{price}</span>
                <span className="text-xs text-slate-400">{p.period}</span>
              </div>

              {p.id === 'free' && (
                <Link href="/#scan" className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-center mb-6">
                  Run a free scan
                </Link>
              )}
              {p.id === 'report' && (
                <Link href="/#scan" className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-center mb-6">
                  Scan first, then unlock
                </Link>
              )}
              {(p.id === 'monitor' || p.id === 'agency') &&
                (isCurrent ? (
                  <div className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-emerald-400 border border-emerald-500/30 text-center mb-6">Your plan</div>
                ) : (
                  <form action="/api/billing/checkout" method="post" className="mb-6">
                    <input type="hidden" name="product" value={p.id} />
                    <input type="hidden" name="currency" value={currency} />
                    <button
                      className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${popular ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'}`}
                    >
                      {currentPlan !== 'free' ? 'Switch to this plan' : 'Start'} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ))}

              <ul className="space-y-2.5 text-xs text-slate-300 flex-1 pt-4 border-t border-slate-800/80">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="mt-8 text-center text-xs text-slate-400">
        Payments by Dodo Payments (merchant of record, invoices include GST/VAT). Cancel any time from your dashboard.
      </p>
    </div>
  );
}
