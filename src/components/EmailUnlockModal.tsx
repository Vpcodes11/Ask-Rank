'use client';

import React, { useState } from 'react';
import { X, Mail, Sparkles, CheckCircle2, Lock, ArrowRight, Loader2 } from 'lucide-react';

interface EmailUnlockModalProps {
  scanId: string;
  storeName: string;
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: (email: string) => void;
}

export default function EmailUnlockModal({
  scanId,
  storeName,
  isOpen,
  onClose,
  onUnlocked
}: EmailUnlockModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid work or store email.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/scan/${scanId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          onUnlocked(email);
          onClose();
        }, 1200);
      } else {
        setError(data.error || 'Failed to unlock scan.');
      }
    } catch (err: any) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        {/* Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-2 pb-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Unlock All 10 Buyer Prompts</h3>
          <p className="text-xs text-slate-400 mt-1.5 px-4 leading-relaxed">
            Enter your email to reveal the remaining 7 commercial buyer queries, competitor citation breakdown, and receive the full PDF report for <strong className="text-slate-200">{storeName}</strong>.
          </p>
        </div>

        {success ? (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce mb-2" />
            <h4 className="text-sm font-bold text-white">Full Report Unlocked!</h4>
            <p className="text-xs text-slate-400 mt-1">Check your inbox for a summary copy.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email / Founder Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="founder@yourstore.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> What you unlock instantly:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400 pl-1">
                <li>All 10 Perplexity, ChatGPT, and Gemini test responses</li>
                <li>Competitor rank matrix (who outranks you and why)</li>
                <li>Top cited domains (Reddit threads & review lists)</li>
                <li>Free downloadable executive summary</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md shadow-emerald-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Unlocking Full Report...
                </>
              ) : (
                <>
                  <span>Unlock Complete 10-Prompt Scan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[10px] text-slate-500 text-center">
              We never spam. One-click unsubscribe anytime.
            </p>
          </form>
        )}

      </div>
    </div>
  );
}
