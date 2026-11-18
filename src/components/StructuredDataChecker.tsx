'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Code2,
  Copy,
  Check,
  ShieldAlert,
  Info,
  ChevronRight
} from 'lucide-react';
import { ShopifyProduct } from '@/lib/types';
import { auditProductStructuredData } from '@/lib/audit-engine';

interface StructuredDataCheckerProps {
  product: ShopifyProduct;
  storeName: string;
}

export default function StructuredDataChecker({ product, storeName }: StructuredDataCheckerProps) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const audit = auditProductStructuredData(product, storeName);

  const handleCopy = () => {
    navigator.clipboard.writeText(audit.generatedSchemaJsonLd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaItems = [
    {
      name: 'Product Schema',
      description: 'Identifies brand, product title, SKU, images, and category for AI knowledge graphs.',
      present: audit.hasProductSchema,
      required: true
    },
    {
      name: 'Offer Schema',
      description: 'Real-time price, currency (INR/USD), and in-stock availability. Enables direct shopping assistant conversion.',
      present: audit.hasOfferSchema,
      required: true
    },
    {
      name: 'AggregateRating Schema',
      description: 'Customer review score & count. CRITICAL: AI engines heavily penalize fake review schemas with 0 reviewCount.',
      present: audit.hasAggregateRating,
      isValid: audit.isRatingValid,
      warning: audit.ratingWarning,
      required: false,
      isSpecialRating: true
    },
    {
      name: 'Organization Schema',
      description: 'Links official store brand, verified logo, and official social handles.',
      present: audit.hasOrgSchema,
      required: false
    },
    {
      name: 'FAQPage Schema',
      description: 'Structured Q&A pairs pulled directly by AI search engines into conversational answer overviews.',
      present: audit.hasFaqSchema,
      required: false
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              JSON-LD Audit
            </span>
            <h4 className="text-sm font-bold text-white truncate max-w-md">{product.title}</h4>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Schema Health Score: <strong className="text-emerald-400">{audit.schemaScore}/100</strong>
          </p>
        </div>

        <button
          onClick={() => setShowCode(!showCode)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors shrink-0"
        >
          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{showCode ? 'Hide JSON-LD' : 'View Generated Schema'}</span>
        </button>
      </div>

      {/* Schema Checklist */}
      <div className="divide-y divide-slate-800/60 my-2">
        {schemaItems.map((item, idx) => {
          return (
            <div key={idx} className="py-3 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                {item.isSpecialRating ? (
                  item.present ? (
                    item.isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                    )
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  )
                ) : item.present ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">{item.name}</span>
                    {item.isSpecialRating && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        Strict Review Guard
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                  {item.warning && (
                    <div className="mt-1.5 p-2 rounded bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.warning}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 text-right">
                {item.isSpecialRating ? (
                  item.present ? (
                    item.isValid ? (
                      <span className="text-[11px] text-emerald-400 font-bold">Verified Real Reviews</span>
                    ) : (
                      <span className="text-[11px] text-rose-400 font-bold">Penalty Risk</span>
                    )
                  ) : (
                    <span className="text-[11px] text-amber-400 font-medium">None (Safe)</span>
                  )
                ) : item.present ? (
                  <span className="text-[11px] text-emerald-400 font-bold">Detected</span>
                ) : (
                  <span className="text-[11px] text-rose-400 font-medium">Missing</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Code Drawer */}
      {showCode && (
        <div className="mt-4 pt-4 border-t border-slate-800 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">Copy & Paste into Shopify theme.liquid / product.json</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied JSON-LD!' : 'Copy Code'}
            </button>
          </div>
          <pre className="p-3 text-[11px] font-mono bg-slate-950 border border-slate-800 rounded-lg text-emerald-300 overflow-x-auto max-h-60">
            {audit.generatedSchemaJsonLd}
          </pre>
        </div>
      )}
    </div>
  );
}
