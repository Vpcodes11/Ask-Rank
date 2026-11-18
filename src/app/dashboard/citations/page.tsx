'use client';

import React, { useEffect, useState } from 'react';
import {
  Share2,
  ExternalLink,
  Sparkles,
  Award,
  ArrowUpRight,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  Loader2
} from 'lucide-react';
import { CitationOpportunity } from '@/lib/types';

export default function CitationsPage() {
  const [opportunities, setOpportunities] = useState<CitationOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOpportunities() {
      try {
        const res = await fetch('/api/citations');
        const data = await res.json();
        if (data.opportunities && data.opportunities.length > 0) {
          setOpportunities(data.opportunities);
        }
      } catch (err) {
        console.error('Failed to load citation opportunities:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOpportunities();
  }, []);

  const handleToggleStatus = async (id: string) => {
    const opp = opportunities.find(o => o.id === id);
    if (!opp) return;

    const next: CitationOpportunity['action_status'] =
      opp.action_status === 'open' ? 'in_progress' :
      opp.action_status === 'in_progress' ? 'pitch_sent' :
      opp.action_status === 'pitch_sent' ? 'won' : 'open';

    // Optimistic UI update
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, action_status: next } : o));

    try {
      await fetch('/api/citations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action_status: next })
      });
    } catch (err) {
      console.error('Failed to persist citation status update:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
        <h3 className="text-lg font-bold text-white">Mapping Competitor Citations...</h3>
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
              GEO Citation Intelligence
            </span>
            <span className="text-xs text-slate-400">Where Perplexity & ChatGPT gather source links</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Where Competitors Get Cited (PR Opportunities)
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            AI search engines don&apos;t just read product pages—they synthesize recommendations from editorial roundups, Reddit threads, and buyer guides. Secure coverage on these domains to dominate recommendations.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-right shrink-0">
          <div className="text-xs text-slate-400">Total High-Impact PR Targets</div>
          <div className="text-2xl font-black text-emerald-400 mt-0.5">{opportunities.length} Domains</div>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="my-8 rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Citation Source Domain</th>
                <th className="py-3.5 px-4">Competitors Mentioned</th>
                <th className="py-3.5 px-4">AI Rec Frequency</th>
                <th className="py-3.5 px-4">Recommended PR Pitch Angle</th>
                <th className="py-3.5 px-4 text-right">Outreach Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {opportunities.map((opp) => (
                <tr key={opp.id} className="hover:bg-slate-800/30 transition-colors">
                  
                  {/* Domain & Link */}
                  <td className="py-4 px-4 align-top">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{opp.domain}</span>
                      <a
                        href={opp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-emerald-400 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-400 border border-slate-700/60 capitalize">
                      {opp.opportunity_type.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Competitors Cited */}
                  <td className="py-4 px-4 align-top">
                    <div className="flex flex-wrap gap-1">
                      {opp.competitors_cited.map((c, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Frequency */}
                  <td className="py-4 px-4 align-top">
                    <div className="font-bold text-emerald-400">{opp.citation_count} Citations</div>
                    <div className="text-[10px] text-slate-500">DA Authority: {opp.authority_score}/100</div>
                  </td>

                  {/* Pitch Angle */}
                  <td className="py-4 px-4 align-top max-w-sm">
                    <p className="text-slate-300 text-xs leading-relaxed bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                      {opp.pitch_angle}
                    </p>
                  </td>

                  {/* Action Status */}
                  <td className="py-4 px-4 align-top text-right shrink-0">
                    <button
                      onClick={() => handleToggleStatus(opp.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        opp.action_status === 'won'
                          ? 'bg-emerald-500 text-slate-950'
                          : opp.action_status === 'pitch_sent'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : opp.action_status === 'in_progress'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {opp.action_status === 'won' && 'Coverage Won! 🎉'}
                      {opp.action_status === 'pitch_sent' && 'Pitch Sent'}
                      {opp.action_status === 'in_progress' && 'In Progress'}
                      {opp.action_status === 'open' && 'Mark as In Progress'}
                    </button>
                    <span className="block text-[10px] text-slate-500 mt-1">Click to advance</span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
