'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Clock,
  Play,
  Mail,
  CheckCircle2,
  Sparkles,
  Bot,
  Search,
  Globe,
  Loader2,
  Calendar
} from 'lucide-react';
import EngineBadge from '@/components/EngineBadge';
import { TrackingPoint } from '@/lib/types';

export default function WeeklyMonitorPage() {
  const [history, setHistory] = useState<TrackingPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningCron, setRunningCron] = useState(false);
  const [emailDigest, setEmailDigest] = useState<any>(null);

  useEffect(() => {
    loadTracking();
  }, []);

  async function loadTracking() {
    try {
      const res = await fetch('/api/tracking');
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleRunNow = async () => {
    setRunningCron(true);
    try {
      const res = await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: 'store-demo-blissclub' })
      });
      const data = await res.json();
      if (data.newPoint) {
        setHistory(prev => [...prev, data.newPoint]);
        setEmailDigest(data.emailSummary);
      }
    } finally {
      setRunningCron(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
        <h3 className="text-lg font-bold text-white">Loading Weekly Tracking Schedule...</h3>
      </div>
    );
  }

  const currentScore = history[history.length - 1]?.overallScore || 78;
  const initialScore = history[0]?.overallScore || 28;
  const totalGain = currentScore - initialScore;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
              Automated GEO Tracking Cron
            </span>
            <span className="text-xs text-slate-400">Monitoring 50 Commercial Prompts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Weekly AI Assistant Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated schedule tracking your AI Visibility Score across ChatGPT Search, Perplexity Sonar, and Gemini Grounding.
          </p>
        </div>

        {/* Cron Controls */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Next scheduled cron: Monday 06:00 UTC</span>
            </div>
            <div className="text-xs text-slate-300 font-medium">Automatic rerun & email digest</div>
          </div>

          <button
            onClick={handleRunNow}
            disabled={runningCron}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
          >
            {runningCron ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Running 50 Prompts...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Rerun Prompt Set Now (Manual Trigger)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Current AI Visibility</span>
          <div className="text-3xl font-black text-emerald-400 mt-1">{currentScore}/100</div>
          <span className="text-xs text-emerald-400 font-semibold mt-1 inline-block">+{totalGain} points since audit</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Active Prompt Set</span>
          <div className="text-3xl font-black text-white mt-1">50 Prompts</div>
          <span className="text-xs text-slate-400 mt-1 inline-block">Tested on 4 search-grounded LLMs</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Founder Weekly Digest</span>
          <div className="text-3xl font-black text-cyan-400 mt-1">Active</div>
          <span className="text-xs text-slate-400 mt-1 inline-block">Sent weekly with competitor wins</span>
        </div>
      </div>

      {/* Historical Timeline Chart */}
      <div className="my-8 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>AI Visibility Trajectory Across Engines</span>
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Overall</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-400" /> ChatGPT</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Gemini</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Google AIO</span>
          </div>
        </div>

        {/* Chart View */}
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-3 pt-8 pb-3 items-end h-64 border-b border-slate-800">
          {history.map((pt, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                {pt.overallScore}
              </span>
              <div
                style={{ height: `${(pt.overallScore / 100) * 100}%` }}
                className="w-full max-w-[42px] rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-md shadow-emerald-500/20 group-hover:from-emerald-400 group-hover:to-teal-300 transition-all"
              />
              <span className="text-[10px] text-slate-400 font-mono text-center truncate max-w-[70px]">
                {pt.date}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 text-xs text-slate-500 flex items-center justify-between">
          <span>Data refreshed automatically every week via background cron trigger.</span>
          <span className="font-mono text-emerald-400">Total data points: {history.length}</span>
        </div>
      </div>

      {/* Email Digest Preview */}
      <div className="my-8 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Founder Weekly Email Summary Preview</h3>
        </div>

        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 font-sans text-xs space-y-3">
          <div className="border-b border-slate-800 pb-3">
            <div className="text-slate-400">Subject: <strong className="text-white">Weekly AskRank Report: BlissClub Activewear AI Visibility Score jumped to {currentScore}/100! 🚀</strong></div>
            <div className="text-slate-500 text-[11px] mt-0.5">To: founder@blissclub.com • Automated Delivery</div>
          </div>

          <p className="text-slate-300 leading-relaxed">
            Hi Team, here is your weekly Generative Engine Optimization briefing. Over the past 7 days, your approved Schema.org updates and technical specifications were indexed across major conversational shopping engines.
          </p>

          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1.5 text-slate-200">
            <div className="font-bold text-emerald-400">Key Wins This Week:</div>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>Overall AI Visibility Score: <strong>{currentScore}/100</strong> (+{totalGain} points all-time)</li>
              <li>Perplexity Sonar now cites your store in <strong>78%</strong> of high-intent activewear searches</li>
              <li>ChatGPT Search recommends your flare pants over Gymshark in 3 high-volume commercial queries</li>
              <li>New Reddit discussion citation detected on r/xxfitness</li>
            </ul>
          </div>

          <p className="text-slate-400 text-[11px]">
            To review your next batch of AI content fixes, visit your AskRank dashboard.
          </p>
        </div>
      </div>

    </div>
  );
}
