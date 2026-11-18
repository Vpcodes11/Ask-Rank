'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Store,
  Layers,
  FileCheck2,
  Sliders,
  Share2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Plus,
  RefreshCw,
  Clock,
  ShieldCheck,
  ChevronRight,
  Loader2
} from 'lucide-react';
import ScoreGauge from '@/components/ScoreGauge';
import { StoreRecord, ShopifyProduct, ContentSuggestion, TrackingPoint } from '@/lib/types';

export default function DashboardPage() {
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreRecord | null>(null);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [tracking, setTracking] = useState<TrackingPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // New store connect modal state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [domainInput, setDomainInput] = useState('');
  const [nicheInput, setNicheInput] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const res = await fetch('/api/stores');
      const data = await res.json();
      if (data.stores && data.stores.length > 0) {
        setStores(data.stores);
        const current = data.stores[0];
        setSelectedStore(current);
        await loadStoreDetails(current.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadStoreDetails(storeId: string) {
    try {
      // 1. Fetch suggestions
      const suggRes = await fetch(`/api/content/suggestions?store_id=${storeId}`);
      const suggData = await suggRes.json();
      setSuggestions(suggData.suggestions || []);

      // 2. Fetch tracking history
      const trackRes = await fetch(`/api/tracking?store_id=${storeId}`);
      const trackData = await trackRes.json();
      setTracking(trackData.history || []);
    } catch (err) {
      console.error(err);
    }
  }

  const handleSyncStore = async () => {
    if (!selectedStore) return;
    setSyncing(true);
    try {
      const res = await fetch(`/api/stores/${selectedStore.id}/sync`, { method: 'POST' });
      const data = await res.json();
      if (data.store) {
        setSelectedStore(data.store);
        await loadStoreDetails(selectedStore.id);
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;

    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopify_domain: domainInput,
          niche: nicheInput || 'Direct-to-Consumer'
        })
      });
      const data = await res.json();
      if (data.store) {
        setStores(prev => [data.store, ...prev]);
        setSelectedStore(data.store);
        await loadStoreDetails(data.store.id);
        setShowConnectModal(false);
        setDomainInput('');
        setNicheInput('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
        <h3 className="text-lg font-bold text-white">Loading Store Dashboard...</h3>
      </div>
    );
  }

  const pendingCount = suggestions.filter(s => s.status === 'pending').length;
  const approvedCount = suggestions.filter(s => s.status === 'approved' || s.status === 'synced').length;
  const latestTrack = tracking[tracking.length - 1];
  const overallScore = latestTrack ? latestTrack.overallScore : 74;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-medium">Shopify GEO Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {selectedStore?.store_name || 'My Shopify Store'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Domain: <code className="text-slate-300 font-mono">{selectedStore?.shopify_domain}</code> • Plan: <span className="text-emerald-400 font-bold uppercase">{selectedStore?.plan || 'Monitor'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Store Switcher */}
          {stores.length > 1 && (
            <select
              value={selectedStore?.id}
              onChange={(e) => {
                const s = stores.find(x => x.id === e.target.value);
                if (s) {
                  setSelectedStore(s);
                  loadStoreDetails(s.id);
                }
              }}
              className="px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
            >
              {stores.map(st => (
                <option key={st.id} value={st.id}>{st.store_name}</option>
              ))}
            </select>
          )}

          <button
            onClick={handleSyncStore}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Auditing Products...' : 'Sync & Re-Audit'}</span>
          </button>

          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Another Store</span>
          </button>
        </div>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        
        {/* Metric 1: AI Visibility Score */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">AI Visibility Score</span>
            <div className="text-3xl font-black text-emerald-400 mt-1">{overallScore}/100</div>
            <span className="text-[10px] text-emerald-400/90 font-medium">Top 8% in activewear</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Content Gaps Detected */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Product Content Gaps</span>
            <div className="text-3xl font-black text-amber-400 mt-1">{selectedStore?.avg_gap_score || 64}%</div>
            <span className="text-[10px] text-slate-500">Missing specs & comparisons</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Pending AI Fixes */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pending Seller Approvals</span>
            <div className="text-3xl font-black text-white mt-1">{pendingCount}</div>
            <span className="text-[10px] text-emerald-400 font-medium">Ready to review & write-back</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Sliders className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Synced Improvements */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Approved & Synced</span>
            <div className="text-3xl font-black text-white mt-1">{approvedCount}</div>
            <span className="text-[10px] text-slate-500">Live in Shopify catalog</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main GEO Modules Grid */}
      <div className="my-10">
        <h2 className="text-lg font-black text-white mb-4">Deep GEO Optimization Modules</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Structured Data Audit */}
          <Link
            href="/dashboard/audit"
            className="group p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                Structured Data Audit
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Check Product, Offer, AggregateRating (with strict review count guard), Organization, and FAQ schema across products.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <span>Inspect Schema & Gaps</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: AI Content Fixer */}
          <Link
            href="/dashboard/content-fixer"
            className="group p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors">
                AI Content Fixer
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Generate specs, comparisons, use cases, and FAQ blocks. Seller approves each diff before write-back (never auto-published).
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-teal-400">
              <span>Review {pendingCount} Pending Diffs</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Citation PR Map */}
          <Link
            href="/dashboard/citations"
            className="group p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                Competitor Citation Map
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                See exactly which Reddit threads, Vogue roundups, and Wirecutter articles AI engines cite to recommend your rivals.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-cyan-400">
              <span>View PR & Listing Targets</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Weekly Automated Monitor */}
          <Link
            href="/dashboard/monitor"
            className="group p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                Weekly Monitor
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Continuous cron runs testing 50 commercial prompts, tracking score gains over time with weekly email digests.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-purple-400">
              <span>View Timeline & Cron</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>
      </div>

      {/* Historical Score Trajectory */}
      <div className="my-10 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>AI Visibility Trajectory (Past 5 Weeks)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Score progression as structured data and approved content fixes are indexed by AI engines.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            +50 pts gain since onboarding
          </span>
        </div>

        {/* CSS Chart Bars */}
        <div className="grid grid-cols-5 gap-3 sm:gap-6 pt-6 pb-2 items-end h-56 border-b border-slate-800">
          {tracking.map((pt, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-xs font-bold text-white opacity-90 group-hover:text-emerald-400 transition-colors">
                {pt.overallScore}
              </span>
              <div
                style={{ height: `${(pt.overallScore / 100) * 100}%` }}
                className="w-full max-w-[48px] rounded-t-lg bg-gradient-to-t from-emerald-600/60 to-emerald-400 transition-all duration-500 group-hover:scale-105 group-hover:from-emerald-500 group-hover:to-teal-300"
              />
              <span className="text-[11px] text-slate-400 font-mono text-center">
                {pt.date}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Overall Score</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-teal-400" /> Perplexity</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400" /> Gemini</span>
          </div>
          <Link href="/dashboard/monitor" className="text-emerald-400 hover:underline">
            View detailed engine breakdown &rarr;
          </Link>
        </div>
      </div>

      {/* Connect Store Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1">Connect Shopify Store</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your Shopify store domain to sync product catalog and run deep GEO audit.
            </p>

            <form onSubmit={handleConnectStore} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Store Domain</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. brand.myshopify.com or brand.com"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category / Niche</label>
                <input
                  type="text"
                  placeholder="e.g. Activewear, Skincare, Coffee"
                  value={nicheInput}
                  onChange={(e) => setNicheInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                >
                  Connect & Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
