'use client';

import React from 'react';
import PricingTable from '@/components/PricingTable';
import { HelpCircle, Sparkles, ShieldCheck } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simple, Transparent Pricing</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Invest in Conversational AI Dominance
        </h1>
        <p className="text-sm text-slate-400 mt-4 leading-relaxed">
          When high-intent shoppers ask ChatGPT, Perplexity, and Gemini for product recommendations, ensure your Shopify store is the first brand they see.
        </p>
      </div>

      {/* Pricing Cards */}
      <PricingTable currentPlan="monitor" />

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mt-20 pt-12 border-t border-slate-800">
        <h2 className="text-xl font-black text-white text-center mb-8">Frequently Asked Questions</h2>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-white text-sm">How does AskRank test whether AI assistants recommend our store?</h4>
            <p className="text-slate-400 mt-1 leading-relaxed">
              We query web-grounded AI search APIs (including Perplexity Sonar, OpenAI Search with GPT-4o, and Gemini with Google Search Grounding) with realistic buyer inquiries tailored to your specific niche and price point. We record whether your store and specific products are mentioned, your rank order, competitors named, and exact URLs cited.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-white text-sm">Will AskRank automatically change my Shopify store content?</h4>
            <p className="text-slate-400 mt-1 leading-relaxed">
              Never. We enforce a strict human-in-the-loop merchant safety protocol. All AI-generated product descriptions, FAQ blocks, and Schema.org changes are presented as side-by-side diffs. You can edit, reject, or approve each item before it is written back to your Shopify catalog.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-white text-sm">What is the AggregateRating schema rule?</h4>
            <p className="text-slate-400 mt-1 leading-relaxed">
              Google and conversational AI scrapers heavily penalize stores that inject fake 5.0-star AggregateRating schemas without genuine customer reviews and verifiable reviewCounts. AskRank checks your review authenticity and guides you on compliant social proof markup.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-white text-sm">What currencies and billing methods do you support?</h4>
            <p className="text-slate-400 mt-1 leading-relaxed">
              We support both INR (₹) for Indian direct-to-consumer merchants and USD ($) for international brands. You can cancel monthly subscriptions with a single click at any time.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
