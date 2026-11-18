'use client';

import React, { useEffect, useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  XCircle,
  UploadCloud,
  Edit3,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Loader2
} from 'lucide-react';
import ContentDiffModal from '@/components/ContentDiffModal';
import { ContentSuggestion } from '@/lib/types';

export default function ContentFixerPage() {
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'synced' | 'rejected'>('all');
  const [selectedSuggestion, setSelectedSuggestion] = useState<ContentSuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [pushingId, setPushingId] = useState<string | null>(null);

  useEffect(() => {
    loadSuggestions();
  }, []);

  async function loadSuggestions() {
    try {
      const res = await fetch('/api/content/suggestions');
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected' | 'synced', editedContent?: string) => {
    setPushingId(id);
    try {
      const res = await fetch('/api/content/suggestions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status,
          after_content: editedContent
        })
      });
      const data = await res.json();
      if (data.success && data.suggestion) {
        setSuggestions(prev => prev.map(s => s.id === id ? data.suggestion : s));
      }
    } finally {
      setPushingId(null);
    }
  };

  const filtered = suggestions.filter(s => filter === 'all' ? true : s.status === filter);
  const pendingCount = suggestions.filter(s => s.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
        <h3 className="text-lg font-bold text-white">Loading AI Content Fixes...</h3>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
              Human-in-the-Loop Content Studio
            </span>
            <span className="text-xs text-slate-400">{pendingCount} pending reviews</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            AI Product Data & FAQ Fixer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enriches product descriptions with specifications, use cases, comparison anchors, and structured FAQs.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {(['all', 'pending', 'approved', 'synced', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                filter === st
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'all' ? 'All Fixes' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Safety Policy Alert */}
      <div className="my-6 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300">
          <strong className="text-white">Strict Merchant Safety Guarantee: </strong>
          AskRank <em>never</em> automatically publishes or overwrites your Shopify store content. Every single change requires you to review the side-by-side diff, edit if desired, and click &quot;Approve & Write to Shopify&quot;.
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4 my-6">
        {filtered.map((s) => {
          const isPending = s.status === 'pending';
          const isSynced = s.status === 'synced';
          const isPushing = pushingId === s.id;

          return (
            <div
              key={s.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 uppercase tracking-wide border border-slate-700">
                      {s.type}
                    </span>
                    <h3 className="text-sm font-bold text-white">{s.product_title}</h3>
                  </div>
                  <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>{s.diff_summary}</span>
                  </p>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  {s.status === 'synced' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Live in Shopify
                    </span>
                  )}
                  {s.status === 'approved' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Approved (Ready to Push)
                    </span>
                  )}
                  {s.status === 'pending' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Awaiting Seller Review
                    </span>
                  )}
                  {s.status === 'rejected' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-500">
                      Rejected
                    </span>
                  )}
                </div>
              </div>

              {/* Side-by-Side Snippets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400">
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Original Shopify Content:</div>
                  <div className="line-clamp-3 whitespace-pre-wrap">{s.before_content}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-emerald-300">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">AI Enriched Version:</div>
                  <div className="line-clamp-3 whitespace-pre-wrap">{s.after_content}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/60">
                <button
                  onClick={() => setSelectedSuggestion(s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Inspect Full Diff & Edit</span>
                </button>

                <div className="flex items-center gap-2">
                  {isPending && (
                    <button
                      onClick={() => handleUpdateStatus(s.id, 'rejected')}
                      className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      Reject
                    </button>
                  )}

                  {!isSynced && (
                    <button
                      onClick={() => handleUpdateStatus(s.id, 'synced')}
                      disabled={isPushing}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
                    >
                      {isPushing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Writing to Shopify...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Approve & Write to Shopify</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Diff Review Modal */}
      <ContentDiffModal
        suggestion={selectedSuggestion}
        isOpen={Boolean(selectedSuggestion)}
        onClose={() => setSelectedSuggestion(null)}
        onUpdateStatus={handleUpdateStatus}
      />

    </div>
  );
}
