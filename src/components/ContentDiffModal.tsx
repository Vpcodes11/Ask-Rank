'use client';

import React, { useState } from 'react';
import { X, Check, XCircle, UploadCloud, Edit3, Sparkles, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { ContentSuggestion } from '@/lib/types';

interface ContentDiffModalProps {
  suggestion: ContentSuggestion | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected' | 'synced', editedContent?: string) => Promise<void>;
}

export default function ContentDiffModal({
  suggestion,
  isOpen,
  onClose,
  onUpdateStatus
}: ContentDiffModalProps) {
  if (!isOpen || !suggestion) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(suggestion.after_content);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (status: 'approved' | 'rejected' | 'synced') => {
    setLoadingAction(status);
    try {
      await onUpdateStatus(suggestion.id, status, isEditing ? content : undefined);
      onClose();
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
                {suggestion.type} Fix
              </span>
              <h3 className="text-base font-bold text-white">{suggestion.product_title}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{suggestion.diff_summary}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side by Side Diff Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          
          {/* Before: Current Shopify Data */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Current Content in Shopify (Before)
              </span>
              <span className="text-[10px] text-slate-500">Unoptimized for AI</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed flex-1">
              {suggestion.before_content || '(Empty content block)'}
            </div>
          </div>

          {/* After: AI Enriched Content */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  AI Enhanced Recommendation (After)
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 font-medium">GEO Ready</span>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Before Push'}</span>
              </button>
            </div>

            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full p-4 rounded-xl bg-slate-950 border border-emerald-500/50 text-xs text-emerald-200 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-500 flex-1 resize-none"
              />
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed flex-1">
                {content}
              </div>
            )}
          </div>

        </div>

        {/* Footer & Approval Controls */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Strict Rule: Changes are <strong>never</strong> auto-published to your Shopify store without seller approval.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleAction('rejected')}
              disabled={Boolean(loadingAction)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              Reject
            </button>

            <button
              onClick={() => handleAction('approved')}
              disabled={Boolean(loadingAction)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
            >
              Approve Only (Review Stage)
            </button>

            <button
              onClick={() => handleAction('synced')}
              disabled={Boolean(loadingAction)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              {loadingAction === 'synced' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Pushing to Shopify...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Approve & Write to Shopify</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
