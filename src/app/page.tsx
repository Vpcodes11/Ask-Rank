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
  Eye,
  Store,
  Layers3,
  Cloud,
  Compass
} from 'lucide-react';
import PricingTable from '@/components/PricingTable';

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Scenic Vista Background Switcher
  const scenicThemes = [
    { id: 'alpine', label: 'Alpine Vista', image: '/images/alpine-observatory.jpg', icon: '🏔️' },
    { id: 'coastal', label: 'Coastal Dawn', image: '/images/coastal-lounge.jpg', icon: '🌊' },
    { id: 'studio', label: 'Glasshouse Studio', image: '/images/studio-glasshouse.jpg', icon: '🌿' },
  ];
  const [selectedTheme, setSelectedTheme] = useState(scenicThemes[0]);

  const handleRunScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter your store address.');
      return;
    }
    setLoading(true);
    setError(null);
    setScanStep('Starting your scan…');
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, niche }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) throw new Error(data.error || 'Could not start the scan');
      router.push(`/scan/${data.id}`);
    } catch (err) {
      setError((err as Error).message || 'Something went wrong. Please check the address.');
      setLoading(false);
      setScanStep(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-emerald-400 selection:text-black">

      {/* ========================================================= */}
      {/* HERO SECTION: Scenic Architectural Glass Portal           */}
      {/* ========================================================= */}
      <section className="relative w-full min-h-[94vh] flex flex-col justify-between overflow-hidden">
        
        {/* Dynamic High-Resolution Scenic Vista Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transition-all duration-1000 transform scale-[1.01]"
          style={{ backgroundImage: `url('${selectedTheme.image}')` }}
        >
          {/* Subtle natural exposure gradient for optimal text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />
        </div>

        {/* --------------------------------------------------------- */}
        {/* TOP FLOATING NAVIGATION (Inside the scenic portal)         */}
        {/* --------------------------------------------------------- */}
        <header className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-8 pt-6 sm:pt-8 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/40 backdrop-blur-md flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Cloud className="w-4 h-4 fill-white/80 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white drop-shadow-md">
                AskRank<span className="text-white/70 font-normal">.ai</span>
              </span>
            </div>
          </Link>

          {/* Centered Translucent Pill Navbar */}
          <nav className="hidden md:flex items-center gap-1 px-4 py-1.5 rounded-full railroad-nav-pill text-xs font-medium text-white/90 shadow-lg backdrop-blur-xl">
            <a href="#how-it-works" className="px-3 py-1 hover:text-white transition-colors">How it works?</a>
            <a href="#difference" className="px-3 py-1 hover:text-white transition-colors">The Difference</a>
            <Link href="/pricing" className="px-3 py-1 hover:text-white transition-colors">Pricing</Link>
            <Link href="/dashboard" className="px-3 py-1 hover:text-white transition-colors">Dashboard</Link>
          </nav>

          {/* Right Action Pill */}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-semibold rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Sign in</span>
            </Link>
          </div>
        </header>

        {/* --------------------------------------------------------- */}
        {/* MAIN HERO CONTENT: Centered directly over the vista        */}
        {/* --------------------------------------------------------- */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 my-auto text-center py-12 sm:py-16">
          
          {/* Centered Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full railroad-nav-pill text-white/90 text-xs font-medium mb-6 shadow-sm backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Real answers from ChatGPT Search, Perplexity &amp; Gemini</span>
          </div>

          {/* Main Clean Typography */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-5 drop-shadow-sm">
            When shoppers ask AI, <br className="hidden sm:inline" />
            <span className="text-slate-900">does it recommend you?</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-900 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium bg-white/55 backdrop-blur-md rounded-2xl px-5 py-3">
            Shoppers now ask AI what to buy. We ask ChatGPT, Perplexity and Gemini the questions your customers ask, and show you whether they recommend your store or your competitors. Free, in about two minutes.
          </p>

          {/* Frosted Glass Input Capsule  */}
          <div id="scan" className="max-w-xl mx-auto scroll-mt-24">
            {loading ? (
              <div className="railroad-capsule rounded-full py-4 px-6 flex items-center justify-center gap-3 text-slate-900 text-xs font-semibold shadow-2xl">
                <div className="w-5 h-5 rounded-full border-2 border-slate-900/30 border-t-slate-900 animate-spin" />
                <span>{scanStep}</span>
              </div>
            ) : (
              <form onSubmit={handleRunScan} className="railroad-capsule rounded-full p-1.5 sm:p-2 flex items-center gap-2 shadow-2xl transition-all hover:border-white/80">
                <input
                  type="text"
                  placeholder="yourstore.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 bg-transparent px-4 sm:px-5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-600/80 focus:outline-none font-medium"
                  required
                />
                <button
                  type="submit"
                  className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <span>Run Free Scan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {error && (
              <div className="mt-3 p-2.5 rounded-full bg-rose-500/20 backdrop-blur-md border border-rose-500/30 text-rose-900 text-xs font-medium">
                {error}
              </div>
            )}

          </div>

        </div>

        {/* --------------------------------------------------------- */}
        {/* BOTTOM BAR: Trust Indicators & Scenic Theme Switcher       */}
        {/* --------------------------------------------------------- */}
        <div className="relative z-10 w-full py-4 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/75 backdrop-blur-xs">
          
          <div className="flex items-center gap-4 sm:gap-6">
            <span>100% Free Scan</span>
            <span>•</span>
            <span>No Credit Card Required</span>
            <span>•</span>
            <span>Multi-Engine Search Grounding</span>
          </div>

          {/* Scenic Vista Switcher Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full railroad-nav-pill border border-white/30 text-white/90">
            <span className="text-[10px] text-white/60 mr-1 flex items-center gap-1">
              <Compass className="w-3 h-3" /> View:
            </span>
            {scenicThemes.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                  selectedTheme.id === t.id
                    ? 'bg-white text-slate-950 font-bold shadow-xs'
                    : 'hover:text-white text-white/70'
                }`}
              >
                <span>{t.icon} {t.label}</span>
              </button>
            ))}
          </div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* SECTION 1: The 3 Core Pillars (Clean, Airy, Minimal)      */}
      {/* ========================================================= */}
      <section id="how-it-works" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2">Simplicity First</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How AskRank Works
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            Three straightforward steps to measure and elevate your store's AI visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="glass-card-clean rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">01 / DISCOVERY</span>
              <h3 className="text-lg font-bold text-white mt-3 mb-2">Instant Free Scan</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your URL. We write 10 real buyer questions for your category and ask ChatGPT Search, Perplexity and Gemini live, then score how often and how high they recommend you, from 0 to 100.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/5 text-[11px] text-slate-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Shareable OG Scorecard</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card-clean rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-teal-400 tracking-wider">02 / AUDIT</span>
              <h3 className="text-lg font-bold text-white mt-3 mb-2">Deep Data Audit</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Check your product pages for missing structured data, specs, materials and sizing, and see exactly which sites AI cites when it recommends your competitors.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/5 text-[11px] text-slate-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Ready-to-paste llms.txt &amp; JSON-LD</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card-clean rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider">03 / APPROVAL</span>
              <h3 className="text-lg font-bold text-white mt-3 mb-2">Fix &amp; Track</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Get product descriptions and FAQs drafted from your real catalog (never invented facts), paste what you like into Shopify, and track your score every week.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/5 text-[11px] text-slate-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>We never touch your store</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: The Core Difference (Minimal Before vs After)   */}
      {/* ========================================================= */}
      <section id="difference" className="py-20 border-t border-white/5 bg-[#080d18]/60 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              The Difference When Buyers Ask AI
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              An illustrative example with a made-up brand, “Northline”. Your scan shows your real answers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Before */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 text-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-rose-400">Before: vague product page</span>
                <span className="text-[10px] text-slate-500">Illustrative</span>
              </div>
              <p className="p-3.5 rounded-xl bg-black/40 text-slate-400 leading-relaxed italic border border-white/5">
                "For high-waisted leggings under ₹2,000 with deep pockets, popular picks are Brand A and Brand B, which list fabric, inseam and pocket size and have many reviews."
              </p>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                <span>Result: Brand ignored</span>
                <span>Thin product data</span>
              </div>
            </div>

            {/* After */}
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-emerald-400">After: specific, quotable details</span>
                <span className="text-[10px] text-emerald-400/80">Illustrative</span>
              </div>
              <p className="p-3.5 rounded-xl bg-black/50 text-slate-200 leading-relaxed border border-emerald-500/20">
                "A good option is <strong>Northline Studio Leggings</strong> (₹1,799): 78% nylon / 22% spandex, 7-inch side pockets, 3 inseam lengths. Its product page answers sizing and care questions directly."
              </p>
              <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-400">
                <span>Easier for AI to recommend</span>
                <span>Specs AI can quote</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: Simple Transparent Pricing                     */}
      {/* ========================================================= */}
      <section className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Simple pricing
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Start with a free scan. Upgrade for automated content fixes and weekly monitoring.
          </p>
        </div>

        <PricingTable />
      </section>

      {/* ========================================================= */}
      {/* MINIMAL FOOTER                                            */}
      {/* ========================================================= */}
      <footer className="border-t border-white/5 py-10 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-white/60" />
            <span className="font-semibold text-white">AskRank</span>
            <span>· AI visibility for online stores</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
          </div>
          <div>© {new Date().getFullYear()} AskRank</div>
        </div>
      </footer>

    </div>
  );
}
