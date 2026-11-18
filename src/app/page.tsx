'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Bot,
  Zap,
  Lock,
  Flame,
  Globe,
  Sliders,
  TrendingUp,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import PricingTable from '@/components/PricingTable';

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleStores = [
    { label: 'BlissClub', url: 'blissclub.com', niche: 'Activewear & Fitness Apparel' },
    { label: 'The Minimalist', url: 'beminimalist.co', niche: 'Clean Skincare & Serums' },
    { label: 'Blue Tokai', url: 'bluetokaicoffee.com', niche: 'Specialty Coffee & Roasts' },
    { label: 'Gymshark', url: 'gymshark.com', niche: 'Athletic Gym Wear' },
  ];

  const handleQuickFill = (store: typeof sampleStores[0]) => {
    setUrl(store.url);
    setNiche(store.niche);
  };

  const handleRunScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a store URL or Shopify domain.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setScanStep('Fetching store public pages, /products.json & sitemap...');
      await new Promise(r => setTimeout(r, 600));

      setScanStep('Synthesizing 10 high-intent commercial buyer queries...');
      await new Promise(r => setTimeout(r, 600));

      setScanStep('Querying Perplexity Sonar, ChatGPT Search & Gemini Grounding...');

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, niche })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete scan');
      }

      setScanStep('Calculating AI Visibility Score & Generating OG Card...');
      await new Promise(r => setTimeout(r, 400));

      router.push(`/scan/${data.scan.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong running the scan. Please verify the URL.');
      setLoading(false);
      setScanStep(null);
    }
  };

  return (
    <div className="relative overflow-hidden">
      
      {/* Background Glows & Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generative Engine Optimization (GEO) for Shopify</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Do AI Assistants Recommend Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Shopify Products?
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Shoppers now ask ChatGPT, Perplexity, and Gemini before buying. AskRank scans your store, benchmarks your AI Visibility Score against competitors, and fixes your product data so AI engines pick you first.
          </p>

          {/* Scanner Box */}
          <div className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl relative">
            
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                  <Cpu className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Analyzing AI Search Grounding...</h3>
                <p className="text-xs text-emerald-400 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {scanStep}
                </p>
                <div className="flex items-center gap-4 mt-6 text-[11px] text-slate-500">
                  <span>Perplexity Sonar</span> • <span>OpenAI GPT-4o</span> • <span>Google Gemini</span> • <span>Google AIO</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRunScan} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  
                  {/* Store URL */}
                  <div className="sm:col-span-7 relative">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="yourstore.com or store.myshopify.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      required
                    />
                  </div>

                  {/* Niche Input */}
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      placeholder="e.g. Organic Skincare, Activewear"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Run Free AI Visibility Scan (No login required)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Quick Demo Pre-fills */}
            {!loading && (
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-slate-500 text-[11px]">Try a live example:</span>
                {sampleStores.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleQuickFill(s)}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors border border-slate-700/60"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Free • No Credit Card Required</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Bot className="w-4 h-4 text-emerald-400" /> Multi-Engine Search Grounding</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-emerald-400" /> Instant 10-Prompt Analysis</span>
          </div>

        </div>
      </section>

      {/* The 3-Step Flow Section */}
      <section className="py-20 border-t border-slate-800/80 bg-slate-950/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">How It Works</h2>
            <h3 className="text-2xl sm:text-3xl font-black text-white">The End-to-End GEO Engine for Shopify</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              From free instant benchmarking to automated Shopify product data enrichment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4 border border-emerald-500/20">
                1
              </div>
              <h4 className="text-base font-bold text-white mb-2">Free Scan (No Login)</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                We crawl your public pages, <code>/products.json</code>, and sitemap. Then we fire 10 realistic buyer queries into Perplexity, ChatGPT, and Gemini to test if your brand is recommended.
              </p>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> AI Visibility Score (0-100)</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Shareable OG Scorecard</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Email unlock for full report</li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-sm mb-4 border border-teal-500/20">
                2
              </div>
              <h4 className="text-base font-bold text-white mb-2">Connect Store & Deep Audit</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Sync full product data. Audit Schema.org markup (validating AggregateRating only when real reviews exist), detect product content gaps, and map competitor citations.
              </p>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Strict schema penalty protection</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Machine-readable llms.txt standard</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> AI-generated content & FAQs</li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm mb-4 border border-cyan-500/20">
                3
              </div>
              <h4 className="text-base font-bold text-white mb-2">Seller Approval & Weekly Tracking</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                You approve each content fix before write-back (never auto-published). Weekly cron re-tests 50 commercial prompts, tracking score gains over time with email digests.
              </p>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Side-by-side Before/After diff</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Historical score chart tracking</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Founder email weekly briefing</li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Transparent Pricing</h2>
          <h3 className="text-2xl sm:text-3xl font-black text-white">Start Free. Upgrade for Automated Fixes.</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Affordable pricing in USD ($) and INR (₹). Cancel anytime.
          </p>
        </div>

        <PricingTable currentPlan="free" />
      </section>

    </div>
  );
}
