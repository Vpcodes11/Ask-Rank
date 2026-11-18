'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Share2,
  ExternalLink,
  ChevronDown,
  Layers,
  Star,
  Quote,
  Copy,
  Check,
  HelpCircle,
  Eye,
  BarChart3,
  RefreshCw,
  ShoppingBag,
  Tag
} from 'lucide-react';
import PricingTable from '@/components/PricingTable';

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Interactive Live AI Simulation State
  const [activeEngineTab, setActiveEngineTab] = useState<'chatgpt' | 'perplexity' | 'gemini'>('perplexity');
  const [copiedLlms, setCopiedLlms] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const sampleStores = [
    { label: 'BlissClub', icon: '🌿', url: 'blissclub.com', niche: 'Women\'s Activewear & Leggings' },
    { label: 'The Minimalist', icon: '✨', url: 'beminimalist.co', niche: 'Clean Skincare & Niacinamide' },
    { label: 'Blue Tokai', icon: '☕', url: 'bluetokaicoffee.com', niche: 'Specialty Coffee & Arabica' },
    { label: 'Gymshark', icon: '⚡', url: 'gymshark.com', niche: 'Gymwear & Compression Gear' },
    { label: 'Rare Beauty', icon: '💄', url: 'rarebeauty.com', niche: 'Clean Cosmetics & Liquid Blush' },
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

  const handleCopySampleLlms = () => {
    const sample = `# BlissClub Activewear
> Performance athletic wear engineered specifically for Indian women's body types.

## Core Catalog
- Move All-Day Leggings: 4-way stretch, squat-proof, 3 secure pockets. Fabric: 75% Nylon, 25% Spandex.
- The Flare Pants: Anti-chafing high-waist yoga pants with ankle slit.

## Verified Certifications
- OEKO-TEX Standard 100 Certified dye & chemical safety.
- 4.8 / 5.0 Star Rating across 24,000+ customer reviews.`;

    navigator.clipboard.writeText(sample);
    setCopiedLlms(true);
    setTimeout(() => setCopiedLlms(false), 2000);
  };

  const faqs = [
    {
      q: 'What is Generative Engine Optimization (GEO)?',
      a: 'Just as SEO optimized pages for Google\'s 10 blue links, GEO (Generative Engine Optimization) structures your Shopify product data, Schema.org entities, specifications, and brand citations so AI answer engines (ChatGPT Search, Perplexity Sonar, Gemini Grounding, Google AI Overviews) synthesize and recommend your brand first when shoppers ask conversational buying questions.'
    },
    {
      q: 'How does the free scan work without login?',
      a: 'We inspect your store\'s public storefront, sitemap, and available public JSON catalog. We synthesize 10 hyper-realistic commercial buyer prompts (e.g. "best squat-proof activewear under ₹2000") and query live LLM APIs with real-time web search. We record whether your brand was recommended, position, competitors named, and sources cited.'
    },
    {
      q: 'Will AskRank ever auto-publish changes to my Shopify store?',
      a: 'Never. AskRank follows a strict human-in-the-loop philosophy. Every enriched product description, FAQ schema block, and specification gap is presented in a side-by-side diff. You review, edit, and click "Approve" before any update writes back to your Shopify catalog.'
    },
    {
      q: 'Why do you enforce strict Schema.org review validation?',
      a: 'Search engines and AI crawlers heavily penalize stores that output fake AggregateRating markup without genuine customer reviews. AskRank flags missing reviews and only enables AggregateRating structured data when genuine third-party review data is verified.'
    },
    {
      q: 'What is llms.txt and why does my store need it?',
      a: 'llms.txt is the emerging open markdown standard (similar to robots.txt) that provides a clean, machine-readable summary of your brand, product USPs, materials, and size guides directly to AI web crawlers like OpenAIBot, PerplexityBot, and Google-Extended.'
    }
  ];

  return (
    <div className="relative overflow-hidden bg-[#070a12] text-slate-100">
      
      {/* Ambient Lighting & Pinterest Moodboard Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-100px] left-1/4 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[140px]" />
        <div className="absolute top-[50px] right-1/4 w-[450px] h-[450px] bg-teal-500/10 rounded-full blur-[130px]" />
        <div className="absolute top-[180px] left-1/3 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none z-0" />

      {/* ========================================================= */}
      {/* HERO SECTION                                              */}
      {/* ========================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Editorial Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-8 shadow-sm backdrop-blur-xl">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="tracking-wide">✦ GENERATIVE ENGINE OPTIMIZATION ✦</span>
            <span className="w-1 h-1 rounded-full bg-emerald-400/60" />
            <span className="text-slate-400 font-normal">For Modern Shopify Brands</span>
          </div>

          {/* Main Editorial Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] mb-7">
            Do AI Assistants Recommend{' '}
            <span className="font-serif-italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200">
              Your
            </span>{' '}
            Shopify Products?
          </h1>

          <p className="text-base sm:text-lg text-slate-300/90 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Shoppers no longer browse 10 blue links. They ask <span className="text-white font-medium">ChatGPT</span>, <span className="text-white font-medium">Perplexity</span>, and <span className="text-white font-medium">Gemini</span> what to buy. AskRank reveals your AI Visibility Score, uncovers competitor citations, and optimizes your product data so AI engines pick you first.
          </p>

          {/* Aesthetic Tactile Scanner Card */}
          <div className="max-w-2xl mx-auto glass-panel-glow rounded-3xl p-5 sm:p-7 backdrop-blur-2xl relative transition-all duration-300">
            
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                  <Cpu className="w-8 h-8 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Simulating Buyer Prompts Across AI Engines...</h3>
                <p className="text-xs text-emerald-400 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {scanStep}
                </p>
                <div className="flex items-center gap-3 mt-6 text-xs text-slate-400">
                  <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60">Perplexity Sonar</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60">ChatGPT Search</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60">Google Gemini</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60">Google AIO</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRunScan} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-left">
                  
                  {/* Store URL Input */}
                  <div className="sm:col-span-7">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                      Store URL or Shopify Domain
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-400/80" />
                      <input
                        type="text"
                        placeholder="yourstore.com or store.myshopify.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-3 text-sm bg-slate-950/80 border border-slate-700/70 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Niche Input */}
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                      Product Niche / Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Activewear, Skincare"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-slate-950/80 border border-slate-700/70 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Run Free AI Visibility Scan</span>
                  <span className="text-[11px] font-normal text-slate-900/80 px-2 py-0.5 rounded-full bg-emerald-950/20">No login required</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </form>
            )}

            {/* Aesthetic Sample Chips */}
            {!loading && (
              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> Or test with a curated D2C storefront:
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {sampleStores.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => handleQuickFill(s)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-medium transition-all border border-slate-700/50 hover:border-emerald-500/40 flex items-center gap-1.5 shadow-sm"
                    >
                      <span>{s.icon}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Social Proof & Trust Pillars */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400">
            <span className="flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Free • No Credit Card Required
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="flex items-center gap-2 font-medium">
              <Bot className="w-4 h-4 text-teal-400" /> Multi-LLM Web Search Grounding
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="flex items-center gap-2 font-medium">
              <Zap className="w-4 h-4 text-amber-400" /> Instant Shareable OG Card
            </span>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* CURATED D2C BRAND STRIP (Aesthetic Marquee)               */}
      {/* ========================================================= */}
      <section className="border-y border-white/5 py-8 bg-[#090e1a]/40 backdrop-blur-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-5">
            Benchmarking AI conversational search across leading categories
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-300">
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-slate-300 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-emerald-400" /> BlissClub (Activewear)
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-slate-300 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-teal-400" /> The Minimalist (Skincare)
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-slate-300 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-amber-400" /> Blue Tokai (Coffee)
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-slate-300 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-indigo-400" /> Gymshark (Apparel)
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-slate-300 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-pink-400" /> Glossier (Beauty)
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-slate-300 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-cyan-400" /> Alo Yoga (Athleisure)
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* INTERACTIVE SHOWSTOPPER: Before vs After GEO Simulation    */}
      {/* ========================================================= */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold mb-3">
              <Eye className="w-3.5 h-3.5" /> Real AI Search Engine Demonstration
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              See What AI Assistants Tell Shoppers <br className="hidden sm:inline" />
              <span className="font-serif-italic font-normal text-emerald-300">Before & After</span> AskRank GEO
            </h2>
            <p className="text-sm text-slate-400 mt-3 max-w-xl mx-auto">
              When a buyer asks: <span className="text-white font-medium italic">"What are the best squat-proof workout leggings under ₹2,000 in India?"</span>
            </p>

            {/* Engine Tabs */}
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 mt-6 gap-1 shadow-inner">
              <button
                onClick={() => setActiveEngineTab('perplexity')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeEngineTab === 'perplexity'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Perplexity Sonar
              </button>
              <button
                onClick={() => setActiveEngineTab('chatgpt')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeEngineTab === 'chatgpt'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ChatGPT Search
              </button>
              <button
                onClick={() => setActiveEngineTab('gemini')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeEngineTab === 'gemini'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Google Gemini
              </button>
            </div>
          </div>

          {/* Dual Mockup Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Left: Before AskRank */}
            <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-rose-500/20 relative shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-rose-500/20 border-b border-l border-rose-500/30 rounded-bl-2xl text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
                <span>❌ WITHOUT ASKRANK</span>
              </div>

              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-300">Default Store Data</h4>
                  <p className="text-[10px] text-slate-400">Missing FAQ schema • Thin specs • No llms.txt</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-300/80 leading-relaxed font-sans">
                <p className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-slate-400 text-xs italic">
                  "I scanned popular shopping guides, but couldn't verify material composition, stretch ratings, or pocket measurements for BlissClub. Therefore, I recommend these alternative brands instead:"
                </p>

                <div className="space-y-2 opacity-70">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-300">1. Decathlon Domyos Leggings</span>
                      <p className="text-[11px] text-slate-400">Cited from 3 buyer guides • ₹1,299</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">Recommended</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-300">2. H&M DryMove Tights</span>
                      <p className="text-[11px] text-slate-400">Cited on GQ India • ₹1,999</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">Recommended</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-rose-400">
                  <span>Your Brand: <strong>Ignored (Position #0)</strong></span>
                  <span>Lost buyer intent: 100%</span>
                </div>
              </div>
            </div>

            {/* Right: With AskRank */}
            <div className="glass-panel-glow rounded-3xl p-6 sm:p-7 border border-emerald-500/40 relative shadow-2xl overflow-hidden bg-gradient-to-b from-slate-900/90 to-[#07131b]">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-500 text-slate-950 rounded-bl-2xl text-[11px] font-extrabold flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>WITH ASKRANK GEO</span>
              </div>

              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AskRank Enriched Store</h4>
                  <p className="text-[10px] text-emerald-400">Validated Schema • High-impact Specs • llms.txt</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-200 leading-relaxed font-sans">
                <p className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 text-xs">
                  "Based on comprehensive fabric tests and verified customer fit data, the <strong>#1 top recommendation</strong> for squat-proof leggings under ₹2,000 is <strong>BlissClub Ultimate 7/8 Leggings</strong>."
                </p>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-2 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        BlissClub Move All-Day Leggings
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">Rank #1 Pick</span>
                      </span>
                      <p className="text-[11px] text-slate-300 mt-1">
                        4-way stretch squat-proof micro-knit with 3 deep pockets. High-compression waistband engineered for Indian women.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono">4.8 ★ (1,420 Verified Reviews)</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">₹1,799</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">Cited: Vogue India [1], BlissClub.com [2]</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-400 font-medium">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Direct click-to-cart link generated</span>
                  <span>AI Visibility Score: 94/100</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* PINTEREST BENTO GRID: 5 Proprietary GEO Superpowers       */}
      {/* ========================================================= */}
      <section className="py-24 border-t border-slate-800/80 bg-slate-950/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <Layers className="w-3.5 h-3.5" /> Full Optimization Toolkit
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              The Architecture Behind <br />
              <span className="font-serif-italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
                AI Recommendation Dominance
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-3">
              Every tool and standard necessary to get your products indexed, cited, and recommended by modern AI assistants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Bento Card 1: 360 AI Citation Radar (7 cols) */}
            <div className="md:col-span-7 glass-panel rounded-3xl p-7 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">360° Multi-Engine AI Citation Radar</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xl mb-6">
                  Unlike traditional SEO tools that only check Google, AskRank simulates real shopping queries across <strong>ChatGPT Search</strong>, <strong>Perplexity Sonar</strong>, <strong>Google Gemini 2.0</strong>, and <strong>Google AI Overviews</strong> simultaneously.
                </p>
              </div>

              {/* Visual Radar Mockup */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[11px] text-slate-400">ChatGPT</p>
                  <p className="text-base font-extrabold text-emerald-400 mt-0.5">82% Mention</p>
                  <p className="text-[10px] text-slate-500">Avg Pos: #1.4</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Perplexity</p>
                  <p className="text-base font-extrabold text-teal-400 mt-0.5">90% Mention</p>
                  <p className="text-[10px] text-slate-500">Avg Pos: #1.1</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Gemini</p>
                  <p className="text-base font-extrabold text-cyan-400 mt-0.5">75% Mention</p>
                  <p className="text-[10px] text-slate-500">Avg Pos: #1.8</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Google AIO</p>
                  <p className="text-base font-extrabold text-indigo-400 mt-0.5">80% Mention</p>
                  <p className="text-[10px] text-slate-500">Avg Pos: #1.3</p>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Schema.org Fraud Shield (5 cols) */}
            <div className="md:col-span-5 glass-panel rounded-3xl p-7 border border-slate-800 hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Schema Penalty Shield</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Google and OpenAI now aggressively de-rank stores that inject fake <code>AggregateRating</code> without real reviews. We audit:
                </p>
                <ul className="space-y-2 text-xs text-slate-300 mb-6">
                  <li className="flex items-center gap-2 text-[11px]"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Product & Offer Schema Validation</li>
                  <li className="flex items-center gap-2 text-[11px]"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> AggregateRating review verification</li>
                  <li className="flex items-center gap-2 text-[11px]"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> FAQPage Rich Schema formatting</li>
                  <li className="flex items-center gap-2 text-[11px]"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Organization identity & social graph</li>
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero spam penalties guaranteed for your storefront.</span>
              </div>
            </div>

            {/* Bento Card 3: Machine-Readable llms.txt (5 cols) */}
            <div className="md:col-span-5 glass-panel rounded-3xl p-7 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">Automated llms.txt Standard</h3>
                  <button
                    onClick={handleCopySampleLlms}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition-colors"
                  >
                    {copiedLlms ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLlms ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  The emerging web standard for AI crawlers. Generates a clean, distilled markdown file describing your brand ethos, materials, and size guides.
                </p>
              </div>

              {/* Code Snippet */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 font-mono text-[10px] text-slate-300 overflow-x-auto leading-relaxed">
                <span className="text-emerald-400"># BlissClub Store Profile</span><br />
                <span className="text-slate-500">&gt; Premium activewear for Indian body types</span><br />
                <span className="text-cyan-400">## Product Highlights</span><br />
                - Fabric: 75% Nylon, 25% Spandex<br />
                - Features: 3 Pockets, Squat-proof
              </div>
            </div>

            {/* Bento Card 4: PR & Competitor Citation Map (7 cols) */}
            <div className="md:col-span-7 glass-panel rounded-3xl p-7 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">High-Authority PR Citation Intelligence</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xl mb-4">
                  AI engines don't invent facts; they synthesize high-authority publications. AskRank reveals the exact roundups, Reddit threads, and buying guides where your competitors get cited.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">Tier 1 PR</span>
                    <span className="text-xs font-semibold text-white">Vogue India: "Best Workout Tights for 2026"</span>
                  </div>
                  <span className="text-[11px] text-slate-400">12x Competitor Mentions</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono">Community</span>
                    <span className="text-xs font-semibold text-white">Reddit r/TwoXIndia: "Gymwear Megathread"</span>
                  </div>
                  <span className="text-[11px] text-slate-400">8x Competitor Mentions</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 3-STEP WORKFLOW                                           */}
      {/* ========================================================= */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <TrendingUp className="w-3.5 h-3.5" /> Frictionless Process
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            From Free Instant Audit to Continuous AI Dominance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="glass-panel rounded-3xl p-7 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-sm mb-6 border border-emerald-500/30">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Free Scan (No Login)</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Enter your storefront URL. We fetch public pages, <code>/products.json</code>, and generate 10 commercial prompts. Query Perplexity, ChatGPT, and Gemini for instant benchmarking.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 text-[11px] text-emerald-400 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Instant 0-100 Scorecard + OG Card
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-panel rounded-3xl p-7 border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 font-extrabold flex items-center justify-center text-sm mb-6 border border-teal-500/30">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Connect Store & Deep Audit</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Sync full product catalogs. Run deep gap detection for missing materials, sizing specs, comparison matrices, and auto-generate Schema.org markup.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 text-[11px] text-teal-400 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> AI content fixes + llms.txt standard
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-panel rounded-3xl p-7 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 font-extrabold flex items-center justify-center text-sm mb-6 border border-cyan-500/30">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Seller Approvals & Weekly Monitor</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Review and approve every enriched description with side-by-side diffs before writing back to Shopify. Track score gains on weekly automated cron reruns.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 text-[11px] text-cyan-400 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Weekly founder email briefing
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* PINTEREST FOUNDER PINBOARD / TESTIMONIALS                 */}
      {/* ========================================================= */}
      <section className="py-24 border-t border-slate-800/80 bg-slate-950/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Curated Founder Feedback</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Loved by High-Growth D2C Brands</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="glass-panel rounded-3xl p-6 border border-slate-800/80 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-6 italic">
                  "Our Perplexity mention rate jumped from 14% to 78% in just 3 weeks after fixing our product specs and FAQ schema blocks. We're now the #1 pick for Indian activewear queries."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800/60">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                  A
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Ananya R.</p>
                  <p className="text-[10px] text-slate-400">Founder, Women's Activewear</p>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 border border-slate-800/80 hover:border-teal-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-6 italic">
                  "The competitor citation map alone is worth 10x the price. It showed us two major gifting guides cited by ChatGPT where our competitors were listed. We got listed, and sales followed."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800/60">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-xs">
                  V
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Vikram M.</p>
                  <p className="text-[10px] text-slate-400">Growth Director, Clean Skincare</p>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-6 italic">
                  "I love the human-in-the-loop approval. AskRank never auto-publishes unreviewed AI hallucinations. I can inspect the diff, edit the wording, and approve with 1 click."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800/60">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">
                  R
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Rohan S.</p>
                  <p className="text-[10px] text-slate-400">Co-founder, Specialty Coffee</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* TRANSPARENT PRICING                                       */}
      {/* ========================================================= */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Tag className="w-3.5 h-3.5" /> Fair & Transparent
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Start Free. Upgrade for Automated Fixes.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Available in USD ($) and INR (₹). Cancel anytime with no questions asked.
          </p>
        </div>

        <PricingTable currentPlan="free" />
      </section>

      {/* ========================================================= */}
      {/* INTERACTIVE FAQ ACCORDION                                 */}
      {/* ========================================================= */}
      <section className="py-24 border-t border-slate-800/80 bg-slate-950/60 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Common Inquiries</h2>
            <h3 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="glass-panel rounded-2xl border border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4"
                  >
                    <span className="text-sm font-bold text-white">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* BOTTOM HIGH-CONVERTING CTA BANNER                         */}
      {/* ========================================================= */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-tr from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5 fill-emerald-300" /> Start in 30 seconds
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Find Out Where Your Brand Ranks in AI Assistants
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mb-8 leading-relaxed">
                Run an instant scan on your Shopify store. See your AI Visibility Score, uncover competitor citations, and download your shareable scorecard.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all hover:scale-105"
                >
                  <Search className="w-4 h-4" />
                  <span>Run Free Scan Now</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <Link
                  href="/pricing"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-xs border border-slate-700/80 transition-colors"
                >
                  View Pricing Plans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
