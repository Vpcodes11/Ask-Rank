'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Share2,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Store,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FileCheck2,
  Download,
  Mail
} from 'lucide-react';
import ScoreGauge from '@/components/ScoreGauge';
import EngineBadge from '@/components/EngineBadge';
import ShareCardModal from '@/components/ShareCardModal';
import EmailUnlockModal from '@/components/EmailUnlockModal';
import { ScanRecord, PromptRunResult } from '@/lib/types';

interface ScanReportClientProps {
  initialScan: ScanRecord;
}

export default function ScanReportClient({ initialScan }: ScanReportClientProps) {
  const [scan, setScan] = useState<ScanRecord>(initialScan);
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>('prompt-1');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const isUnlocked = scan.unlocked;
  const visiblePrompts = isUnlocked ? scan.prompts : scan.prompts.slice(0, 3);
  const lockedPrompts = isUnlocked ? [] : scan.prompts.slice(3);

  // Group results by prompt_id
  const resultsByPrompt = new Map<string, PromptRunResult[]>();
  for (const r of scan.results) {
    const list = resultsByPrompt.get(r.prompt_id) || [];
    list.push(r);
    resultsByPrompt.set(r.prompt_id, list);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Banner & Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
              Free AI Visibility Audit
            </span>
            <span className="text-xs text-slate-500 font-mono">ID: {scan.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight">
            {scan.store_name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Store URL: <a href={scan.url} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-emerald-400 underline">{scan.clean_domain}</a> • Niche: <span className="text-emerald-400 font-medium">{scan.niche}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Share Result Card (OG)</span>
          </button>

          <a
            href={`/api/export/pdf?scan_id=${scan.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>PDF Summary</span>
          </a>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Connect Store & Fix Gaps</span>
          </Link>
        </div>
      </div>

      {/* Main Score & Breakdown Card */}
      <div className="my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
        
        {/* Left Column: Big Radial Gauge */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center lg:border-r border-slate-800/80 lg:pr-8">
          <ScoreGauge score={scan.score} breakdown={scan.breakdown} size="lg" showBreakdown={false} />
          <p className="text-xs text-slate-400 text-center max-w-sm mt-4 leading-relaxed">
            Overall GEO rating based on mention rate, recommendation position, engine diversity, and authoritative citation links.
          </p>
        </div>

        {/* Right Column: Breakdown & Quick Stats */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
            AI Assistant Performance Breakdown
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Mention Rate</span>
              <div className="text-xl font-black text-white mt-1">{scan.breakdown.mention_rate}%</div>
              <span className="text-[10px] text-slate-500">Appeared in recommendations</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Position</span>
              <div className="text-xl font-black text-emerald-400 mt-1">
                {scan.breakdown.avg_position ? `#${scan.breakdown.avg_position}` : 'N/A'}
              </div>
              <span className="text-[10px] text-slate-500">Rank when cited</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Engine Diversity</span>
              <div className="text-xl font-black text-teal-400 mt-1">{scan.breakdown.engine_diversity}%</div>
              <span className="text-[10px] text-slate-500">Cross-engine reach</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Source Coverage</span>
              <div className="text-xl font-black text-purple-400 mt-1">{scan.breakdown.source_authority}%</div>
              <span className="text-[10px] text-slate-500">Editorial & Reddit depth</span>
            </div>
          </div>

          {/* Active Engines Tested */}
          <div className="pt-2">
            <span className="text-[11px] text-slate-400 mb-2 block font-medium">Search-Grounded AI Engines Evaluated:</span>
            <div className="flex flex-wrap items-center gap-2">
              <EngineBadge engine="perplexity" />
              <EngineBadge engine="openai_search" />
              <EngineBadge engine="gemini_grounding" />
              <EngineBadge engine="google_aio" />
            </div>
          </div>
        </div>

      </div>

      {/* Prompts Section */}
      <div className="my-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-black text-white">Commercial Buyer Prompts Test Results</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Testing 10 high-intent shopping queries with real-time web retrieval.
              {!isUnlocked && (
                <span className="text-emerald-400 ml-1 font-semibold">
                  (Showing 3 free prompts • 7 locked)
                </span>
              )}
            </p>
          </div>

          {!isUnlocked && (
            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors shrink-0"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlock 7 Hidden Prompts (Free with email)</span>
            </button>
          )}
        </div>

        {/* Visible Prompts List */}
        <div className="space-y-4">
          {visiblePrompts.map((p, idx) => {
            const promptResults = resultsByPrompt.get(p.id) || [];
            const isExpanded = expandedPrompt === p.id;
            const anyMentioned = promptResults.some(r => r.mentioned);

            return (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => setExpandedPrompt(isExpanded ? null : p.id)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase tracking-wide">
                          {p.category}
                        </span>
                        <span className="text-[10px] text-slate-500">Volume: {p.volume_estimate}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                        &quot;{p.query}&quot;
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {anyMentioned ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Brand Recommended
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle className="w-3.5 h-3.5" /> Not Ranked
                      </span>
                    )}

                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Engine Details */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-800/60 bg-slate-950/40">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {promptResults.map((r) => (
                        <div
                          key={r.id}
                          className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <EngineBadge engine={r.engine} size="sm" />
                              <span className={`text-[11px] font-bold ${r.mentioned ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {r.mentioned ? (r.position ? `Rank #${r.position}` : 'Mentioned') : 'Not Ranked'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 font-mono line-clamp-4 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 my-2">
                              {r.raw_response}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-800/60 space-y-2 text-[11px]">
                            {/* Competitors Named */}
                            {r.competitors.length > 0 && (
                              <div>
                                <span className="text-slate-500 font-medium">Competitors Named: </span>
                                <span className="text-slate-300">
                                  {r.competitors.map(c => c.name).join(', ')}
                                </span>
                              </div>
                            )}

                            {/* Citations */}
                            {r.sources.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-slate-500 font-medium">Cited: </span>
                                {r.sources.map((s, sIdx) => (
                                  <a
                                    key={sIdx}
                                    href={s.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1"
                                  >
                                    <span>{s.domain}</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Blurred Teaser Section (Prompts 4 to 10) */}
        {!isUnlocked && lockedPrompts.length > 0 && (
          <div className="relative mt-6 rounded-3xl border border-slate-800 overflow-hidden p-6 bg-slate-900/40">
            {/* Blurred background preview cards */}
            <div className="filter blur-md select-none opacity-40 space-y-3 pointer-events-none">
              {lockedPrompts.map((p, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-slate-700 font-bold text-xs flex items-center justify-center">
                      {idx + 4}
                    </span>
                    <span className="text-sm font-bold text-white">&quot;{p.query}&quot;</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                    Engine Outputs Locked
                  </span>
                </div>
              ))}
            </div>

            {/* Unlock Overlay Callout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">7 More Commercial Buyer Prompts Hidden</h3>
              <p className="text-xs text-slate-400 max-w-md mt-1.5 mb-5 leading-relaxed">
                Unlock the remaining queries (comparisons, ingredients, price-point queries) and see which competitors are taking your traffic.
              </p>
              <button
                onClick={() => setShowEmailModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                <Mail className="w-4 h-4" />
                <span>Enter Email to Unlock Full 10-Prompt Report (Free)</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Competitor Rank Matrix & Citations Section */}
      <div className="my-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Competitor Matrix */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Who AI Assistants Recommend Instead
            </h3>
            <span className="text-[11px] text-slate-400">In this niche</span>
          </div>

          <div className="space-y-3">
            {scan.competitors_found.map((c, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200">{c.name}</div>
                  <div className="text-[10px] text-slate-500">
                    Recommended in {c.mentionCount} queries ({c.percentage}%)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-rose-400">Avg Rank #{c.avgPosition}</div>
                  <div className="text-[10px] text-slate-500">AI Priority Pick</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Citations */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Where Competitors Get Cited
            </h3>
            <span className="text-[11px] text-slate-400">PR & Backlink Targets</span>
          </div>

          <div className="space-y-3">
            {scan.top_sources.map((s, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="min-w-0 pr-3">
                  <div className="text-xs font-bold text-slate-200 truncate">{s.domain}</div>
                  <div className="text-[10px] text-slate-500">{s.authority_tier}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-400">{s.frequency} Citations</span>
                  <div className="text-[10px] text-slate-500">In AI Answers</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Upgrade Banner */}
      <div className="my-10 p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-500/5">
        <div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
            Next Step: Fix Your Product Data
          </span>
          <h3 className="text-xl font-black text-white mt-2">
            Ready to overtake your competitors on ChatGPT & Perplexity?
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Connect your Shopify store to run full Schema.org audits, generate AI product descriptions & FAQ blocks with human approval, and track 50 prompts weekly.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard"
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            Connect Store & Start Audit
          </Link>
          <Link
            href="/pricing"
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            View Pricing
          </Link>
        </div>
      </div>

      {/* Modals */}
      <ShareCardModal
        scan={scan}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      <EmailUnlockModal
        scanId={scan.id}
        storeName={scan.store_name}
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onUnlocked={(email) => {
          setScan({ ...scan, email, unlocked: true });
        }}
      />

    </div>
  );
}
