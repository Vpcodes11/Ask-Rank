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
    // Load pre-seeded citation opportunities
    const defaultOpportunities: CitationOpportunity[] = [
      {
        id: 'cite-opp-1',
        store_id: 'store-demo-blissclub',
        domain: 'reddit.com/r/xxfitness',
        url: 'https://reddit.com/r/xxfitness/comments/indian_activewear_reviews',
        competitors_cited: ['Gymshark', 'Lululemon', 'Kica Active'],
        citation_count: 14,
        authority_score: 94,
        opportunity_type: 'reddit_discussion',
        pitch_angle: 'Participate in community comparison thread or host authentic founder AMA on fabric longevity and squat tests.',
        action_status: 'open'
      },
      {
        id: 'cite-opp-2',
        store_id: 'store-demo-blissclub',
        domain: 'vogue.in/fashion',
        url: 'https://vogue.in/fashion/content/best-homegrown-indian-athleisure-brands',
        competitors_cited: ['BlissClub', 'Kica', 'Cultsport'],
        citation_count: 8,
        authority_score: 88,
        opportunity_type: 'editorial_roundup',
        pitch_angle: 'Pitch Vogue fashion editor for upcoming "Monsoon Travel Essentials" editorial inclusion.',
        action_status: 'in_progress'
      },
      {
        id: 'cite-opp-3',
        store_id: 'store-demo-blissclub',
        domain: 'gqindia.com/fitness',
        url: 'https://gqindia.com/look-good/fitness-gear-roundup',
        competitors_cited: ['Nike', 'Under Armour', 'Gymshark'],
        citation_count: 6,
        authority_score: 85,
        opportunity_type: 'editorial_roundup',
        pitch_angle: 'Send performance sample kits to lifestyle reviewers testing high-impact moisture wicking.',
        action_status: 'open'
      },
      {
        id: 'cite-opp-4',
        store_id: 'store-demo-blissclub',
        domain: 'fitreviewhub.com',
        url: 'https://fitreviewhub.com/reviews/best-squat-proof-leggings',
        competitors_cited: ['Lululemon Align', 'Gymshark Flex'],
        citation_count: 5,
        authority_score: 62,
        opportunity_type: 'comparison_review',
        pitch_angle: 'Request dedicated product review with side-by-side opacity & pocket depth lab measurement.',
        action_status: 'pitch_sent'
      },
      {
        id: 'cite-opp-5',
        store_id: 'store-demo-blissclub',
        domain: 'nytimes.com/wirecutter',
        url: 'https://nytimes.com/wirecutter/reviews/best-workout-leggings',
        competitors_cited: ['Lululemon', 'Athleta', 'Outdoor Voices'],
        citation_count: 18,
        authority_score: 98,
        opportunity_type: 'editorial_roundup',
        pitch_angle: 'Target the Wirecutter apparel testing team with verified blind-feel swatch comparison.',
        action_status: 'open'
      }
    ];

    setOpportunities(defaultOpportunities);
    setLoading(false);
  }, []);

  const handleToggleStatus = (id: string) => {
    setOpportunities(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next: CitationOpportunity['action_status'] =
        o.action_status === 'open' ? 'in_progress' :
        o.action_status === 'in_progress' ? 'pitch_sent' :
        o.action_status === 'pitch_sent' ? 'won' : 'open';
      return { ...o, action_status: next };
    }));
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
