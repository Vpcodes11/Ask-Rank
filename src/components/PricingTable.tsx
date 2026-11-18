'use client';

import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap, Building2, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface PricingTableProps {
  currentPlan?: string;
  onUpgrade?: (planId: string, currency: 'USD' | 'INR') => Promise<void>;
}

export default function PricingTable({ currentPlan = 'free', onUpgrade }: PricingTableProps) {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [successPlan, setSuccessPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free Scan',
      badge: 'Zero Risk',
      price: currency === 'INR' ? '₹0' : '$0',
      period: 'forever',
      description: 'Quick check to see if AI assistants know your store exists.',
      features: [
        'Store public crawl (/products.json & sitemap)',
        '10 commercial buyer prompts generated',
        '3 prompts visible (7 blurred)',
        'AI Visibility Score (0-100)',
        'Shareable result card (OG badge)',
      ],
      cta: 'Current Plan',
      isCurrent: currentPlan === 'free',
      popular: false,
    },
    {
      id: 'report',
      name: 'Full Deep Audit',
      badge: 'One-Time',
      price: currency === 'INR' ? '₹1,499' : '$19',
      period: 'one-time',
      description: 'Unlock everything from your scan + complete schema audit.',
      features: [
        'Unlocks all 10 buyer prompts & engine outputs',
        'Complete Structured Data (JSON-LD) audit',
        'Strict AggregateRating penalty check',
        'Full Competitor Citation Intelligence list',
        'Product Content Gap score across catalog',
        'High-resolution PDF report download',
      ],
      cta: 'Get Full Report',
      isCurrent: currentPlan === 'report',
      popular: false,
    },
    {
      id: 'monitor',
      name: 'Weekly Monitor & Fixer',
      badge: 'Most Popular',
      price: currency === 'INR' ? '₹1,999' : '$29',
      period: '/month',
      description: 'Continuous tracking, 50 prompts, and AI fixes synced back to Shopify.',
      features: [
        'Everything in Deep Audit',
        'Weekly automated prompt runs (50 commercial queries)',
        'Historical score tracking & engine trends',
        'AI Content Fixer (descriptions & FAQ blocks)',
        'Human-in-the-loop review before write-back to Shopify',
        'Machine-readable llms.txt & About Page builder',
        'Weekly executive email digest to founders',
      ],
      cta: 'Start Weekly Tracking',
      isCurrent: currentPlan === 'monitor',
      popular: true,
    },
    {
      id: 'agency',
      name: 'Agency & Multi-Store',
      badge: '10 Stores',
      price: currency === 'INR' ? '₹7,999' : '$99',
      period: '/month',
      description: 'For agencies, aggregators, and enterprise e-commerce portfolios.',
      features: [
        'Everything in Weekly Monitor',
        'Manage up to 10 Shopify Stores simultaneously',
        'White-label PDF reports with your agency branding',
        'Client-ready presentation slides & exports',
        'Dedicated API access & webhook alerts',
        'Priority engine execution queue',
      ],
      cta: 'Upgrade to Agency',
      isCurrent: currentPlan === 'agency',
      popular: false,
    },
  ];

  const handleSelectPlan = async (planId: string) => {
    if (planId === currentPlan) return;
    setLoadingPlan(planId);
    try {
      if (onUpgrade) {
        await onUpgrade(planId, currency);
      } else {
        const res = await fetch('/api/billing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: planId, currency })
        });
        if (res.ok) {
          setSuccessPlan(planId);
          setTimeout(() => window.location.reload(), 1000);
        }
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="py-6">
      
      {/* Currency Switcher */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={`text-xs font-semibold ${currency === 'INR' ? 'text-emerald-400' : 'text-slate-400'}`}>
          India (INR ₹)
        </span>
        <button
          onClick={() => setCurrency(c => c === 'INR' ? 'USD' : 'INR')}
          className="relative w-14 h-7 rounded-full bg-slate-800 border border-slate-700 p-1 transition-colors"
        >
          <div
            className={`w-5 h-5 rounded-full bg-emerald-500 shadow-md transform transition-transform ${
              currency === 'USD' ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
        </button>
        <span className={`text-xs font-semibold ${currency === 'USD' ? 'text-emerald-400' : 'text-slate-400'}`}>
          Global (USD $)
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => {
          const isSelected = p.isCurrent || successPlan === p.id;
          return (
            <div
              key={p.id}
              className={`relative rounded-2xl flex flex-col p-6 transition-all ${
                p.popular
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 border-2 border-emerald-500 shadow-xl shadow-emerald-500/10'
                  : 'bg-slate-900/80 border border-slate-800'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                  {p.badge}
                </div>
              )}

              <div className="mb-4">
                <h4 className="text-base font-bold text-white">{p.name}</h4>
                <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{p.description}</p>
              </div>

              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl font-black text-white">{p.price}</span>
                <span className="text-xs text-slate-400 font-medium">{p.period}</span>
              </div>

              <button
                onClick={() => handleSelectPlan(p.id)}
                disabled={isSelected || loadingPlan === p.id}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 mb-6 ${
                  isSelected
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : p.popular
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 hover:scale-[1.02]'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                {loadingPlan === p.id ? (
                  <span>Processing...</span>
                ) : isSelected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Active Plan</span>
                  </>
                ) : (
                  <>
                    <span>{p.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <div className="space-y-2.5 text-xs text-slate-300 flex-1 pt-4 border-t border-slate-800/80">
                {p.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Cancel anytime with 1-click</span>
        <span>•</span>
        <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-emerald-400" /> Instant activation</span>
        <span>•</span>
        <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-emerald-400" /> GST / VAT invoices provided</span>
      </div>

    </div>
  );
}
